import { authClient } from "@/lib/auth-client";

export const signInWithGoogle = async () => {
    await authClient.signIn.social({
        provider: "google"
    })
}

export const signInWithGoogleAsProvider = async () => {
    await authClient.signIn.social({
        provider: "google",
        callbackURL: "/api/auth/provider-google-callback"
    })
}