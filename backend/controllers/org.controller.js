import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Organization from "../models/Organization.js";

export const getOrgPublic = async (req, res) => {
  const userOrg = await User.findById(req.params.id).select(
    "name role organizationName organizationType bio location causes skills teamMembers orgApprovalStatus organizationId"
  );

  if (!userOrg || userOrg.role !== "organization") {
    return res.status(404).json({ message: "Organization not found" });
  }

  const org =
    (userOrg.organizationId
      ? await Organization.findById(userOrg.organizationId)
      : await Organization.findOne({ createdBy: userOrg._id })) || null;

  const approvalStatus = org?.approvalStatus || userOrg.orgApprovalStatus;

  if (approvalStatus !== "approved") {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user?.role === "admin") {
          return res.json({
            id: userOrg._id,
            name: userOrg.name,
            organizationName: org?.name || userOrg.organizationName || userOrg.name,
            organizationType: org?.type || userOrg.organizationType,
            orgApprovalStatus: approvalStatus,
            bio: org?.description || userOrg.bio,
            location: org?.location || userOrg.location,
            causes: userOrg.causes || [],
            skills: userOrg.skills || [],
            teamMembers: (org?.teamMembers || userOrg.teamMembers || []).map((m) => ({
              name: m.name,
              role: m.role,
            })),
          });
        }
      } catch {
        // fall through to forbidden
      }
    }
    return res.status(403).json({ message: "Organization not approved" });
  }

  res.json({
    id: userOrg._id,
    name: userOrg.name,
    organizationName: org?.name || userOrg.organizationName || userOrg.name,
    organizationType: org?.type || userOrg.organizationType,
    orgApprovalStatus: approvalStatus,
    bio: org?.description || userOrg.bio,
    location: org?.location || userOrg.location,
    causes: userOrg.causes || [],
    skills: userOrg.skills || [],
    teamMembers: (org?.teamMembers || userOrg.teamMembers || []).map((m) => ({
      name: m.name,
      role: m.role,
    })),
  });
};
