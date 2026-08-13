import { fromNodeHeaders } from "better-auth/node";
import { ApiResponse } from "@/shared/utils/api-response.js";
import { ApiError } from "@/shared/utils/api-error.js";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { updateProfileSchema } from "../schemas/user.schema.js";
import { auth } from "../auth.js";
import { getSessionFromRequest } from "../middleware.js";

const getUser = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "User fetched",
            data: {
                user: req.session!.user,
                session: req.session!.session,
            },
        }),
    );
});

const updateProfile = asyncHandler(async (req, res) => {
    const { name } = updateProfileSchema.parse(req.body);

    await auth.api.updateUser({
        body: { name },
        headers: fromNodeHeaders(req.headers),
    });

    const session = await getSessionFromRequest(req);

    if (!session) {
        throw new ApiError(500, "Failed to load session after profile update");
    }

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Profile updated",
            data: { user: session.user },
        }),
    );
});

export { getUser, updateProfile };
