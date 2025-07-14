export const log = async (...args: unknown[]) => {
  try {
    await fetch("/__log", {
      method: "POST",
      body: JSON.stringify({ log: args }),
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // ignore errors silently
  }
};
