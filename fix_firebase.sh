cat << 'INNER_EOF' >> firebase.ts

export const updateUserUID = async (oldUid: string, newUid: string, userData: any) => {
    try {
        // 1. Copy core to new UID in Firestore
        await setDoc(doc(db, "users", newUid), { ...userData, id: newUid }, { merge: true });

        // 2. Fetch bulky data from old UID
        const bulkySnap = await getDoc(doc(db, "user_data", oldUid)).catch(() => null);
        if (bulkySnap && bulkySnap.exists()) {
            // Copy to new UID
            await setDoc(doc(db, "user_data", newUid), bulkySnap.data(), { merge: true });
            // Delete old bulky data
            await deleteDoc(doc(db, "user_data", oldUid)).catch(() => {});
        }

        // 3. Delete old core
        await deleteDoc(doc(db, "users", oldUid)).catch(() => {});
        await set(ref(rtdb, \`users/\${oldUid}\`), null).catch(() => {});

        // 4. Save to RTDB
        await set(ref(rtdb, \`users/\${newUid}\`), { ...userData, id: newUid }).catch(() => {});

        return true;
    } catch (e) {
        console.error("Error migrating UID:", e);
        return false;
    }
};
INNER_EOF
