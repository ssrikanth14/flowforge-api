import { verifyRefreshToken } from "../../utils/token.js";
import { authRepository } from "../../repositories/auth.repository.js";

export const logout = async (refreshToken) => {
	if (!refreshToken) return;

	try {
		const payload = verifyRefreshToken(refreshToken);
		if (payload.sessionId) {
			await authRepository.revokeSession(payload.sessionId);
		}
	} catch {
		// Logout remains idempotent for expired or malformed cookies.
	}
};
