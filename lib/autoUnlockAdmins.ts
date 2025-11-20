import Admin from "@/models/Admin";

export async function autoUnlockExpiredAccounts() {
  try {
    const now = new Date();
    
    const result = await Admin.updateMany(
      {
        status: "inactive",
        accountLockedUntil: { $lte: now, $ne: null }
      },
      {
        $set: {
          status: "active",
          accountLockedUntil: null,
          accountLockReason: ""
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`Auto-unlocked ${result.modifiedCount} expired admin account(s)`);
    }

    return result;
  } catch (error) {
    console.error("Error in autoUnlockExpiredAccounts:", error);
    throw error;
  }
}
