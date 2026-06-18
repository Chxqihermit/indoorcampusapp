import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { BRAND_BLUE } from "@/constants/colors";
function RegisterScreen({ onLoginPress }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await register(name.trim(), email.trim(), password, passwordConfirmation);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  return <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput
    style={styles.input}
    autoCapitalize="none"
    keyboardType="email-address"
    placeholder="Email"
    value={email}
    onChangeText={setEmail}
  />
      <TextInput
    style={styles.input}
    secureTextEntry
    placeholder="Password"
    value={password}
    onChangeText={setPassword}
  />
      <TextInput
    style={styles.input}
    secureTextEntry
    placeholder="Confirm password"
    value={passwordConfirmation}
    onChangeText={setPasswordConfirmation}
  />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Register</Text>}
      </Pressable>

      <Pressable onPress={onLoginPress}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </Pressable>
    </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 24, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16
  },
  btn: {
    backgroundColor: BRAND_BLUE,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { textAlign: "center", color: BRAND_BLUE, marginTop: 16, fontWeight: "600" },
  error: { color: "#dc2626", marginBottom: 8 }
});
export {
  RegisterScreen
};
