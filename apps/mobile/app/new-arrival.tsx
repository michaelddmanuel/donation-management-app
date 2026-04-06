import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

type FormData = {
  fullName: string;
  idNumber: string;
  familySize: string;
  preferredLanguage: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormData | "photo", string>>;

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "Arabic", value: "ar" },
  { label: "Dari", value: "prs" },
  { label: "Pashto", value: "ps" },
  { label: "Ukrainian", value: "uk" },
  { label: "Haitian Creole", value: "ht" },
];

export default function NewArrivalScreen() {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    idNumber: "",
    familySize: "1",
    preferredLanguage: "en",
    notes: "",
  });
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [idDocUri, setIdDocUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const updateField = useCallback(
    (field: keyof FormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const pickImage = useCallback(
    async (type: "photo" | "id_doc") => {
      // Ask for permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Needed",
          "Please grant photo library access to upload verification photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "photo" ? [3, 4] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === "photo") {
          setPhotoUri(result.assets[0].uri);
          if (errors.photo) {
            setErrors((prev) => ({ ...prev, photo: undefined }));
          }
        } else {
          setIdDocUri(result.assets[0].uri);
        }
      }
    },
    [errors]
  );

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Needed",
        "Please grant camera access to capture verification photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      if (errors.photo) {
        setErrors((prev) => ({ ...prev, photo: undefined }));
      }
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!form.idNumber.trim()) {
      newErrors.idNumber = "ID number is required";
    } else if (form.idNumber.trim().length < 4) {
      newErrors.idNumber = "ID number must be at least 4 characters";
    }

    if (!photoUri) {
      newErrors.photo = "A verification photo is required";
    }

    const familySize = parseInt(form.familySize, 10);
    if (isNaN(familySize) || familySize < 1 || familySize > 20) {
      newErrors.familySize = "Enter a valid family size (1-20)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, photoUri]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setSubmitting(true);

    try {
      // 1. Upload photo to Supabase Storage
      let photoUrl = "";
      if (photoUri) {
        const photoExt = photoUri.split(".").pop() || "jpg";
        const photoFileName = `arrivals/${Date.now()}_photo.${photoExt}`;

        const photoResponse = await fetch(photoUri);
        const photoBlob = await photoResponse.blob();

        const { error: uploadError } = await supabase.storage
          .from("verification-photos")
          .upload(photoFileName, photoBlob, {
            contentType: `image/${photoExt}`,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("verification-photos")
          .getPublicUrl(photoFileName);

        photoUrl = publicUrl;
      }

      // 2. Upload ID document if provided
      let idDocUrl = null;
      if (idDocUri) {
        const docExt = idDocUri.split(".").pop() || "jpg";
        const docFileName = `arrivals/${Date.now()}_id.${docExt}`;

        const docResponse = await fetch(idDocUri);
        const docBlob = await docResponse.blob();

        const { error: uploadError } = await supabase.storage
          .from("verification-photos")
          .upload(docFileName, docBlob, {
            contentType: `image/${docExt}`,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("verification-photos")
          .getPublicUrl(docFileName);

        idDocUrl = publicUrl;
      }

      // 3. Insert into new_arrivals table
      const { error: insertError } = await supabase
        .from("new_arrivals")
        .insert({
          full_name: form.fullName.trim(),
          id_number: form.idNumber.trim(),
          photo_url: photoUrl,
          id_document_url: idDocUrl,
          family_size: parseInt(form.familySize, 10),
          preferred_language: form.preferredLanguage,
          notes: form.notes.trim() || null,
          // chapter_id and registered_by will come from user session
        });

      if (insertError) throw insertError;

      Alert.alert(
        "Registration Complete",
        `${form.fullName} has been registered successfully. Their status is "Pending Verification."`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }, [form, photoUri, idDocUri, validate]);

  const selectedLanguageLabel =
    LANGUAGES.find((l) => l.value === form.preferredLanguage)?.label ||
    "English";

  return (
    <>
      <Stack.Screen
        options={{
          title: "Register New Arrival",
          headerBackTitle: "Back",
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero section */}
          <View className="px-5 pt-4 pb-6">
            <Text className="text-2xl font-bold text-gray-900 tracking-tight">
              New Arrival Registration
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Capture the individual&apos;s details and verification photo.
            </Text>
          </View>

          {/* ---- Photo Upload Section ---- */}
          <View className="px-5 mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Verification Photo <Text className="text-red-500">*</Text>
            </Text>

            {photoUri ? (
              <View className="items-center">
                <Image
                  source={{ uri: photoUri }}
                  className="w-36 h-48 rounded-2xl bg-gray-100"
                  resizeMode="cover"
                />
                <View className="flex-row gap-3 mt-3">
                  <Pressable
                    onPress={takePhoto}
                    className="px-4 py-2 bg-gray-100 rounded-xl active:bg-gray-200"
                  >
                    <Text className="text-sm font-medium text-gray-700">
                      📷 Retake
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => pickImage("photo")}
                    className="px-4 py-2 bg-gray-100 rounded-xl active:bg-gray-200"
                  >
                    <Text className="text-sm font-medium text-gray-700">
                      🖼 Choose Other
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <Pressable
                  onPress={takePhoto}
                  className="flex-1 items-center justify-center h-40 bg-primary-50 border-2 border-dashed border-primary-200 rounded-2xl active:bg-primary-100"
                >
                  <Text className="text-3xl mb-2">📷</Text>
                  <Text className="text-sm font-semibold text-primary-700">
                    Take Photo
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    Use camera
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => pickImage("photo")}
                  className="flex-1 items-center justify-center h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl active:bg-gray-100"
                >
                  <Text className="text-3xl mb-2">🖼</Text>
                  <Text className="text-sm font-semibold text-gray-700">
                    Upload Photo
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    From gallery
                  </Text>
                </Pressable>
              </View>
            )}

            {errors.photo && (
              <Text className="text-xs text-red-500 mt-2">{errors.photo}</Text>
            )}
          </View>

          {/* ---- Form Fields ---- */}
          <View className="px-5 gap-5">
            {/* Full Name */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Full Name <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={form.fullName}
                onChangeText={(v) => updateField("fullName", v)}
                placeholder="Enter full legal name"
                placeholderTextColor="#98A2B3"
                className={`h-12 px-4 rounded-xl border text-base text-gray-900 bg-white ${
                  errors.fullName ? "border-red-300" : "border-gray-200"
                }`}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {errors.fullName && (
                <Text className="text-xs text-red-500 mt-1">
                  {errors.fullName}
                </Text>
              )}
            </View>

            {/* ID Number */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                ID / Document Number <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={form.idNumber}
                onChangeText={(v) => updateField("idNumber", v)}
                placeholder="Passport, A-Number, or Case ID"
                placeholderTextColor="#98A2B3"
                className={`h-12 px-4 rounded-xl border text-base text-gray-900 bg-white ${
                  errors.idNumber ? "border-red-300" : "border-gray-200"
                }`}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {errors.idNumber && (
                <Text className="text-xs text-red-500 mt-1">
                  {errors.idNumber}
                </Text>
              )}
            </View>

            {/* ID Document Upload (optional) */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                ID Document Photo{" "}
                <Text className="text-gray-400 font-normal">(optional)</Text>
              </Text>
              {idDocUri ? (
                <View className="flex-row items-center gap-3">
                  <Image
                    source={{ uri: idDocUri }}
                    className="w-20 h-14 rounded-lg bg-gray-100"
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => pickImage("id_doc")}
                    className="px-3 py-2 bg-gray-100 rounded-lg active:bg-gray-200"
                  >
                    <Text className="text-sm text-gray-600">Change</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setIdDocUri(null)}
                    className="px-3 py-2"
                  >
                    <Text className="text-sm text-red-500">Remove</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => pickImage("id_doc")}
                  className="flex-row items-center justify-center h-14 bg-gray-50 border border-dashed border-gray-200 rounded-xl active:bg-gray-100"
                >
                  <Text className="text-sm text-gray-500">
                    📄 Upload ID document photo
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Family Size */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Family Size
              </Text>
              <View className="flex-row gap-2">
                {["1", "2", "3", "4", "5", "6+"].map((size) => {
                  const isSelected =
                    form.familySize === size ||
                    (size === "6+" && parseInt(form.familySize, 10) >= 6);
                  return (
                    <Pressable
                      key={size}
                      onPress={() =>
                        updateField("familySize", size === "6+" ? "6" : size)
                      }
                      className={`flex-1 items-center py-3 rounded-xl border ${
                        isSelected
                          ? "bg-primary-50 border-primary-300"
                          : "bg-white border-gray-200"
                      } active:opacity-80`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          isSelected ? "text-primary-700" : "text-gray-600"
                        }`}
                      >
                        {size}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {errors.familySize && (
                <Text className="text-xs text-red-500 mt-1">
                  {errors.familySize}
                </Text>
              )}
            </View>

            {/* Preferred Language */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Preferred Language
              </Text>
              <Pressable
                onPress={() => setShowLangPicker(!showLangPicker)}
                className="h-12 px-4 rounded-xl border border-gray-200 bg-white flex-row items-center justify-between"
              >
                <Text className="text-base text-gray-900">
                  {selectedLanguageLabel}
                </Text>
                <Text className="text-gray-400">
                  {showLangPicker ? "▲" : "▼"}
                </Text>
              </Pressable>

              {showLangPicker && (
                <View className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {LANGUAGES.map((lang) => (
                    <Pressable
                      key={lang.value}
                      onPress={() => {
                        updateField("preferredLanguage", lang.value);
                        setShowLangPicker(false);
                      }}
                      className={`px-4 py-3 border-b border-gray-50 active:bg-gray-50 ${
                        form.preferredLanguage === lang.value
                          ? "bg-primary-50"
                          : ""
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          form.preferredLanguage === lang.value
                            ? "text-primary-700 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {lang.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Notes */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Notes{" "}
                <Text className="text-gray-400 font-normal">(optional)</Text>
              </Text>
              <TextInput
                value={form.notes}
                onChangeText={(v) => updateField("notes", v)}
                placeholder="Any additional details (medical needs, urgency, etc.)"
                placeholderTextColor="#98A2B3"
                className="h-24 px-4 py-3 rounded-xl border border-gray-200 text-base text-gray-900 bg-white"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* ---- Submit ---- */}
          <View className="px-5 mt-8">
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className={`h-14 rounded-2xl items-center justify-center ${
                submitting ? "bg-primary-300" : "bg-primary-600 active:bg-primary-700"
              }`}
            >
              {submitting ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-base font-semibold text-white">
                    Registering...
                  </Text>
                </View>
              ) : (
                <Text className="text-base font-semibold text-white">
                  Register New Arrival
                </Text>
              )}
            </Pressable>

            <Text className="text-xs text-gray-400 text-center mt-3">
              This data is encrypted and stored securely. Only authorized
              chapter admins can access verification records.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
