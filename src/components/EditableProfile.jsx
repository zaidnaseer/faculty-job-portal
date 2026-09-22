import { useEffect, useRef, useState } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Pencil,
    X,
    Check,
    GraduationCap,
    Briefcase,
    BookOpen,
    Award,
    Plus,
    Trash2,
    Link as LinkIcon,
    Camera,
    FileText,
    Download,
    Eye,
    Upload,
} from "lucide-react";
import { formatMonthYear } from "../utils/dateFormatting";
import defaultProfileImage from "../../assets/default-profile.jpg";

const EditableProfile = ({
    profile,
    setProfile,
    onSave,
    canEdit,
    showBackButton = false,
    onBack,
    resumeUrl = "",
    resumeName = "resume.pdf",
    onRefreshResume,
    onUploadResume,
    onDeleteResume,
    profileImageUrl = "",
    onUploadProfileImage,
    onDeleteProfileImage,
}) => {
    const [activeEditor, setActiveEditor] = useState(null);
    const [editorIndex, setEditorIndex] = useState(null);
    const [editorForm, setEditorForm] = useState({});
    const [editorError, setEditorError] = useState("");
    const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
    const [draftSkills, setDraftSkills] = useState([]);
    const [newSkillValue, setNewSkillValue] = useState("");
    const [editingSkillIndex, setEditingSkillIndex] = useState(null);
    const [editingSkillValue, setEditingSkillValue] = useState("");
    const [skillsError, setSkillsError] = useState("");
    const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
    const [activeResumeUrl, setActiveResumeUrl] = useState(resumeUrl);
    const [activeResumeName, setActiveResumeName] = useState(resumeName);
    const [isResumeActionLoading, setIsResumeActionLoading] = useState(false);
    const [resumeUploadError, setResumeUploadError] = useState("");
    const [isProfileImageActionLoading, setIsProfileImageActionLoading] = useState(false);
    const [profileImageError, setProfileImageError] = useState("");
    const [isProfileImageMenuOpen, setIsProfileImageMenuOpen] = useState(false);
    const [isProfileImageDeleteConfirmOpen, setIsProfileImageDeleteConfirmOpen] = useState(false);
    const [profileImageCrop, setProfileImageCrop] = useState(null);
    const [profileImageCropOffset, setProfileImageCropOffset] = useState({ x: 0, y: 0 });
    const [profileImageCropSize, setProfileImageCropSize] = useState(null);
    const [profileImageCropSelectionSize, setProfileImageCropSelectionSize] = useState(220);
    const [isProfileImageCropResizing, setIsProfileImageCropResizing] = useState(false);
    const profileImageMenuRef = useRef(null);
    const profileImageCropDragRef = useRef(null);
    const profileImageCropResizeRef = useRef(null);

    const handleProfileImageCropResizeKeyDown = (event) => {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            return;
        }

        event.preventDefault();
        const delta = event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -2 : 2;
        setProfileImageCropSelectionSize((size) => Math.min(280, Math.max(140, size + delta)));
    };

    useEffect(() => {
        if (!isProfileImageMenuOpen) {
            return undefined;
        }

        const handleDocumentPointerDown = (event) => {
            if (!profileImageMenuRef.current?.contains(event.target)) {
                setIsProfileImageMenuOpen(false);
            }
        };

        document.addEventListener("pointerdown", handleDocumentPointerDown);
        return () => document.removeEventListener("pointerdown", handleDocumentPointerDown);
    }, [isProfileImageMenuOpen]);

    useEffect(() => () => {
        if (profileImageCrop?.url) {
            URL.revokeObjectURL(profileImageCrop.url);
        }
    }, [profileImageCrop?.url]);

    const hasText = (value) => typeof value === "string" && value.trim().length > 0;

    const parseMonth = (value) => {
        if (!hasText(value) || /^(present|current)$/i.test(value.trim())) {
            return null;
        }

        const trimmedValue = value.trim();
        if (/^\d{4}-\d{2}$/.test(trimmedValue)) {
            const [year, month] = trimmedValue.split("-").map(Number);
            return { year, month };
        }

        const date = new Date(trimmedValue);
        return Number.isNaN(date.getTime())
            ? null
            : { year: date.getFullYear(), month: date.getMonth() + 1 };
    };

    const formatExperienceDuration = (start, end, isCurrent) => {
        const startMonth = parseMonth(start);
        if (!startMonth) {
            return "";
        }

        const endMonth = isCurrent || !hasText(end)
            ? { year: new Date().getFullYear(), month: new Date().getMonth() + 1 }
            : parseMonth(end);
        if (!endMonth) {
            return "";
        }

        const totalMonths = Math.max(
            1,
            (endMonth.year - startMonth.year) * 12 + endMonth.month - startMonth.month,
        );
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        const duration = [];

        if (years > 0) {
            duration.push(`${years} yr${years === 1 ? "" : "s"}`);
        }
        if (months > 0) {
            duration.push(`${months} mo${months === 1 ? "" : "s"}`);
        }

        return duration.join(" ");
    };

    const updateProfileField = (name, value) => {
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const editorDefaults = {
        personal: {
            name: profile?.name || "",
            title: profile?.title || "",
            email: profile?.email || "",
            phone: profile?.phone || "",
            location: profile?.location || "",
        },
        about: { summary: profile?.summary || "" },
        education: { degree: "", institution: "", year: "" },
        experience: { title: "", institution: "", start: "", end: "", description: "" },
        publications: { title: "", description: "", link: "" },
    };

    const openEditor = (type, index = null) => {
        if (type === "personal") {
            setActiveEditor("personal");
            setEditorIndex(null);
            setEditorForm({
                name: profile?.name || "",
                title: profile?.title || "",
                email: profile?.email || "",
                phone: profile?.phone || "",
                location: profile?.location || "",
            });
            setEditorError("");
            return;
        }

        const existing = index === null ? null : profile?.[type]?.[index];
        setActiveEditor(type);
        setEditorIndex(index);
        setEditorForm({ ...editorDefaults[type], ...(existing || {}) });
        setEditorError("");
    };

    const closeEditor = () => {
        setActiveEditor(null);
        setEditorIndex(null);
        setEditorForm({});
        setEditorError("");
    };

    const saveEditor = () => {
        if (activeEditor === "personal") {
            if (!hasText(editorForm.name)) {
                setEditorError("Name is required.");
                return;
            }
            if (!hasText(editorForm.email)) {
                setEditorError("Email is required.");
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(editorForm.email.trim())) {
                setEditorError("Please enter a valid email address.");
                return;
            }
            if (!hasText(editorForm.phone)) {
                setEditorError("Phone number is required.");
                return;
            }

            const nextProfile = {
                ...profile,
                name: editorForm.name.trim(),
                title: typeof editorForm.title === "string" ? editorForm.title.trim() : "",
                email: editorForm.email.trim(),
                phone: editorForm.phone.trim(),
                location: typeof editorForm.location === "string" ? editorForm.location.trim() : "",
            };
            setProfile(nextProfile);
            onSave(nextProfile);
            closeEditor();
            return;
        }

        const requiredField = activeEditor === "about" ? editorForm.summary : editorForm.degree || editorForm.title;
        const institutionRequired = activeEditor === "education" || activeEditor === "experience";
        if (!hasText(requiredField) || (institutionRequired && !hasText(editorForm.institution))) {
            setEditorError(activeEditor === "about" ? "Add some content before saving." : "Complete the required fields before saving.");
            return;
        }

        const nextProfile = activeEditor === "about"
            ? { ...profile, summary: editorForm.summary.trim() }
            : {
                ...profile,
                [activeEditor]: (() => {
                    const list = Array.isArray(profile?.[activeEditor]) ? [...profile[activeEditor]] : [];
                    if (editorIndex === null) list.push(editorForm);
                    else list[editorIndex] = editorForm;
                    return list;
                })(),
            };
        setProfile(nextProfile);
        onSave(nextProfile);
        closeEditor();
    };

    const deleteEditorEntry = () => {
        if (editorIndex === null || activeEditor === "about" || activeEditor === "personal") return;

        const nextProfile = {
            ...profile,
            [activeEditor]: profile[activeEditor].filter((_, index) => index !== editorIndex),
        };
        setProfile(nextProfile);
        onSave(nextProfile);
        closeEditor();
    };

    const openSkillsModal = () => {
        setIsSkillsModalOpen(true);
        setDraftSkills(Array.isArray(profile?.skills) ? [...profile.skills] : []);
        setNewSkillValue("");
        setEditingSkillIndex(null);
        setEditingSkillValue("");
        setSkillsError("");
    };

    const closeSkillsModal = () => {
        setIsSkillsModalOpen(false);
        setDraftSkills([]);
        setNewSkillValue("");
        setEditingSkillIndex(null);
        setEditingSkillValue("");
        setSkillsError("");
    };

    const saveSkillsModal = () => {
        let nextSkills = draftSkills;

        if (editingSkillIndex !== null) {
            const trimmed = editingSkillValue.trim();
            if (!trimmed) {
                setSkillsError("Skill cannot be empty.");
                return;
            }
            if (nextSkills.some((skill, index) => index !== editingSkillIndex && skill.toLowerCase() === trimmed.toLowerCase())) {
                setSkillsError("That skill has already been added.");
                return;
            }
            nextSkills = [...draftSkills];
            nextSkills[editingSkillIndex] = trimmed;
        }

        const pendingNew = newSkillValue.trim();
        if (pendingNew) {
            if (nextSkills.some((skill) => skill.toLowerCase() === pendingNew.toLowerCase())) {
                setSkillsError("That skill has already been added.");
                return;
            }
            nextSkills = [...nextSkills, pendingNew];
        }

        const nextProfile = { ...profile, skills: nextSkills };
        setProfile(nextProfile);
        onSave(nextProfile);
        setIsSkillsModalOpen(false);
        setDraftSkills([]);
        setNewSkillValue("");
        setEditingSkillIndex(null);
        setEditingSkillValue("");
        setSkillsError("");
    };

    const addSkill = () => {
        const trimmed = newSkillValue.trim();
        if (!trimmed) {
            setSkillsError("Enter a skill before adding.");
            return;
        }

        if (draftSkills.some((skill) => skill.toLowerCase() === trimmed.toLowerCase())) {
            setSkillsError("That skill has already been added.");
            return;
        }

        setDraftSkills((prev) => [...prev, trimmed]);
        setNewSkillValue("");
        setSkillsError("");
    };

    const startEditSkill = (index) => {
        setEditingSkillIndex(index);
        setEditingSkillValue(draftSkills[index] || "");
        setSkillsError("");
    };

    const cancelEditSkill = () => {
        setEditingSkillIndex(null);
        setEditingSkillValue("");
        setSkillsError("");
    };

    const confirmEditSkill = () => {
        const trimmed = editingSkillValue.trim();
        if (!trimmed) {
            setSkillsError("Skill cannot be empty.");
            return;
        }

        if (draftSkills.some((skill, index) => index !== editingSkillIndex && skill.toLowerCase() === trimmed.toLowerCase())) {
            setSkillsError("That skill has already been added.");
            return;
        }

        setDraftSkills((prev) => {
            const next = [...prev];
            next[editingSkillIndex] = trimmed;
            return next;
        });
        setEditingSkillIndex(null);
        setEditingSkillValue("");
        setSkillsError("");
    };

    const deleteSkill = (index) => {
        setDraftSkills((prev) => prev.filter((_, i) => i !== index));
        if (editingSkillIndex === index) {
            setEditingSkillIndex(null);
            setEditingSkillValue("");
        }
    };

    const getFreshResume = async () => {
        setIsResumeActionLoading(true);
        try {
            const freshResume = onRefreshResume ? await onRefreshResume() : null;
            const nextUrl = freshResume?.url || resumeUrl;
            const nextName = freshResume?.filename || resumeName;

            if (!nextUrl) return null;

            setActiveResumeUrl(nextUrl);
            setActiveResumeName(nextName);
            return { url: nextUrl, filename: nextName };
        } finally {
            setIsResumeActionLoading(false);
        }
    };

    const handleOpenResume = async () => {
        const freshResume = await getFreshResume();
        if (freshResume) {
            setIsResumePreviewOpen(true);
        }
    };

    const handleDownloadResume = async () => {
        const freshResume = await getFreshResume();
        if (!freshResume) return;

        const link = document.createElement("a");
        link.href = freshResume.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = freshResume.filename || "resume.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleDeleteResume = async () => {
        if (!onDeleteResume || isResumeActionLoading) return;

        setIsResumeActionLoading(true);
        try {
            await onDeleteResume();
            setIsResumePreviewOpen(false);
            setActiveResumeUrl("");
            setActiveResumeName("resume.pdf");
        } catch (error) {
            alert(error.message || "Failed to delete resume.");
        } finally {
            setIsResumeActionLoading(false);
        }
    };

    const handleUploadResume = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        setResumeUploadError("");

        if (!file || !onUploadResume) return;

        const allowedExtensions = /\.(pdf|doc|docx|txt|rtf)$/i;
        if (!allowedExtensions.test(file.name) || file.size > 5 * 1024 * 1024) {
            setResumeUploadError("Choose a PDF, Word, TXT, or RTF file up to 5MB.");
            return;
        }

        setIsResumeActionLoading(true);
        try {
            await onUploadResume(file);
        } catch (error) {
            setResumeUploadError(error.message || "Failed to upload resume.");
        } finally {
            setIsResumeActionLoading(false);
        }
    };

    const isPdfResume =
        profile?.resumeFile?.contentType === "application/pdf" ||
        activeResumeName.toLowerCase().endsWith(".pdf") ||
        activeResumeUrl.toLowerCase().includes(".pdf");

    const handleUploadProfileImage = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        setProfileImageError("");

        if (!file || !onUploadProfileImage) return;

        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
            setProfileImageError("Choose a JPEG, PNG, WEBP, or GIF image up to 5MB.");
            return;
        }

        const url = URL.createObjectURL(file);
        setProfileImageCrop({ file, url });
        setProfileImageCropOffset({ x: 0, y: 0 });
        setProfileImageCropSize(null);
        setProfileImageCropSelectionSize(220);
        setIsProfileImageMenuOpen(false);
    };

    const getCropImageLayout = () => {
        if (!profileImageCropSize) return null;

        const cropViewportSize = 280;
        const selectionSize = profileImageCropSelectionSize;
        const scale = Math.max(
            cropViewportSize / profileImageCropSize.width,
            cropViewportSize / profileImageCropSize.height,
        );
        const width = profileImageCropSize.width * scale;
        const height = profileImageCropSize.height * scale;
        const baseLeft = (cropViewportSize - width) / 2;
        const baseTop = (cropViewportSize - height) / 2;
        const selectionLeft = (cropViewportSize - selectionSize) / 2;
        const selectionTop = (cropViewportSize - selectionSize) / 2;
        const minX = selectionLeft + selectionSize - width - baseLeft;
        const maxX = selectionLeft - baseLeft;
        const minY = selectionTop + selectionSize - height - baseTop;
        const maxY = selectionTop - baseTop;

        return {
            cropViewportSize,
            selectionSize,
            selectionLeft,
            selectionTop,
            scale,
            width,
            height,
            left: baseLeft + Math.min(maxX, Math.max(minX, profileImageCropOffset.x)),
            top: baseTop + Math.min(maxY, Math.max(minY, profileImageCropOffset.y)),
        };
    };

    const handleProfileImageCropPointerDown = (event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        profileImageCropDragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            offset: profileImageCropOffset,
        };
    };

    const handleProfileImageCropPointerMove = (event) => {
        const drag = profileImageCropDragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        setProfileImageCropOffset({
            x: drag.offset.x + event.clientX - drag.startX,
            y: drag.offset.y + event.clientY - drag.startY,
        });
    };

    const handleProfileImageCropPointerUp = (event) => {
        if (profileImageCropDragRef.current?.pointerId === event.pointerId) {
            profileImageCropDragRef.current = null;
        }
    };

    const handleProfileImageCropResizePointerDown = (event, corner) => {
        event.stopPropagation();
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        profileImageCropResizeRef.current = {
            corner,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            size: profileImageCropSelectionSize,
        };
        setIsProfileImageCropResizing(true);
    };

    const handleProfileImageCropResizePointerMove = (event) => {
        const resize = profileImageCropResizeRef.current;
        if (!resize || resize.pointerId !== event.pointerId) return;

        const deltaX = event.clientX - resize.startX;
        const deltaY = event.clientY - resize.startY;
        const diagonalDelta = {
            topLeft: -(deltaX + deltaY) / 2,
            topRight: (deltaX - deltaY) / 2,
            bottomLeft: (-deltaX + deltaY) / 2,
            bottomRight: (deltaX + deltaY) / 2,
        }[resize.corner];

        setProfileImageCropSelectionSize(Math.min(280, Math.max(140, resize.size + diagonalDelta)));
    };

    const handleProfileImageCropResizePointerUp = (event) => {
        if (profileImageCropResizeRef.current?.pointerId === event.pointerId) {
            profileImageCropResizeRef.current = null;
            setIsProfileImageCropResizing(false);
        }
    };

    useEffect(() => {
        if (!isProfileImageCropResizing) {
            return undefined;
        }

        const handleWindowPointerMove = (event) => {
            event.preventDefault();
            handleProfileImageCropResizePointerMove(event);
        };
        const handleWindowPointerUp = (event) => {
            handleProfileImageCropResizePointerUp(event);
        };

        window.addEventListener("pointermove", handleWindowPointerMove, { passive: false });
        window.addEventListener("pointerup", handleWindowPointerUp);
        window.addEventListener("pointercancel", handleWindowPointerUp);

        return () => {
            window.removeEventListener("pointermove", handleWindowPointerMove);
            window.removeEventListener("pointerup", handleWindowPointerUp);
            window.removeEventListener("pointercancel", handleWindowPointerUp);
        };
    }, [isProfileImageCropResizing]);

    const closeProfileImageCrop = () => {
        if (profileImageCrop?.url) URL.revokeObjectURL(profileImageCrop.url);
        setProfileImageCrop(null);
        setProfileImageCropSize(null);
        setProfileImageCropOffset({ x: 0, y: 0 });
        setIsProfileImageCropResizing(false);
        profileImageCropResizeRef.current = null;
    };

    useEffect(() => {
        if (!profileImageCrop && !isProfileImageDeleteConfirmOpen && !activeEditor && !isSkillsModalOpen) {
            return undefined;
        }

        const handleEscape = (event) => {
            if (event.key !== 'Escape') return;

            if (profileImageCrop) {
                closeProfileImageCrop();
            } else if (isProfileImageDeleteConfirmOpen) {
                setIsProfileImageDeleteConfirmOpen(false);
            } else if (activeEditor) {
                closeEditor();
            } else if (isSkillsModalOpen) {
                closeSkillsModal();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [profileImageCrop, isProfileImageDeleteConfirmOpen, activeEditor, isSkillsModalOpen]);

    const confirmProfileImageCrop = async () => {
        const layout = getCropImageLayout();
        if (!profileImageCrop || !layout || !onUploadProfileImage) return;

        setIsProfileImageActionLoading(true);
        setProfileImageError("");

        try {
            const image = new Image();
            image.src = profileImageCrop.url;
            await image.decode();

            const canvas = document.createElement("canvas");
            canvas.width = 512;
            canvas.height = 512;
            const context = canvas.getContext("2d");
            const sourceX = Math.max(0, (layout.selectionLeft - layout.left) / layout.scale);
            const sourceY = Math.max(0, (layout.selectionTop - layout.top) / layout.scale);
            const sourceSize = layout.selectionSize / layout.scale;

            context.drawImage(
                image,
                sourceX,
                sourceY,
                sourceSize,
                sourceSize,
                0,
                0,
                canvas.width,
                canvas.height,
            );

            const croppedFile = await new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error("The image could not be cropped."));
                        return;
                    }
                    resolve(new File([blob], "profile-picture.png", { type: "image/png" }));
                }, "image/png");
            });

            await onUploadProfileImage(croppedFile);
            closeProfileImageCrop();
        } catch (error) {
            setProfileImageError(error.message || "Failed to crop or upload profile image.");
        } finally {
            setIsProfileImageActionLoading(false);
        }
    };

    const handleDeleteProfileImage = async () => {
        if (!onDeleteProfileImage || isProfileImageActionLoading) return;

        setIsProfileImageActionLoading(true);
        setProfileImageError("");
        try {
            await onDeleteProfileImage();
            return true;
        } catch (error) {
            setProfileImageError(error.message || "Failed to delete profile image.");
            return false;
        } finally {
            setIsProfileImageActionLoading(false);
        }
    };

    const confirmDeleteProfileImage = async () => {
        const deleted = await handleDeleteProfileImage();
        if (deleted) {
            setIsProfileImageDeleteConfirmOpen(false);
            setIsProfileImageMenuOpen(false);
        }
    };

    const profileImageCropLayout = getCropImageLayout();

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-6 pt-4 pb-2 flex justify-between items-center">
                {showBackButton ? (
                    <button
                        onClick={onBack}
                        className="btn-back"
                    >
                        ← Back
                    </button>
                ) : (
                    <div></div>
                )}
            </div>

            <div className="w-full px-6">
                <div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 pb-10">
                <div className={`flex flex-col md:flex-row gap-6 -mt-20`}>
                    <div className="relative w-full md:w-1/3 bg-white rounded-xl shadow p-6 text-center">
                        {canEdit && (
                            <button
                                type="button"
                                onClick={() => openEditor("personal")}
                                aria-label="Edit personal details"
                                title="Edit personal details"
                                className="absolute right-4 top-4 rounded-md p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            >
                                <Pencil size={18} />
                            </button>
                        )}
                        <div ref={profileImageMenuRef} className="group relative mx-auto h-32 w-32">
                            <img
                                src={profileImageUrl || defaultProfileImage}
                                alt={hasText(profile?.name) ? profile.name : "Profile"}
                                className="h-32 w-32 rounded-full border-4 border-white object-cover"
                            />

                            {canEdit && onUploadProfileImage && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsProfileImageMenuOpen((isOpen) => !isOpen)}
                                        aria-label="Edit profile picture"
                                        aria-expanded={isProfileImageMenuOpen}
                                        className="absolute inset-0 hidden items-center justify-center rounded-full bg-gray-900/0 text-white opacity-0 transition hover:bg-gray-900/60 hover:opacity-100 focus:bg-gray-900/60 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group-hover:bg-gray-900/60 group-hover:opacity-100 md:flex"
                                    >
                                        <Pencil size={24} aria-hidden="true" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsProfileImageMenuOpen((isOpen) => !isOpen)}
                                        aria-label="Edit profile picture"
                                        aria-expanded={isProfileImageMenuOpen}
                                        className="absolute bottom-0 right-0 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:hidden"
                                    >
                                        <Pencil size={16} aria-hidden="true" />
                                    </button>

                                    {isProfileImageMenuOpen && (
                                        <div className="absolute left-1/2 top-full z-20 mt-2 w-44 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-1 text-left shadow-lg">
                                            <label className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <Camera size={16} />
                                                Change photo
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                                    onChange={handleUploadProfileImage}
                                                    disabled={isProfileImageActionLoading}
                                                    className="sr-only"
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsProfileImageDeleteConfirmOpen(true)}
                                                disabled={!profileImageUrl || !onDeleteProfileImage || isProfileImageActionLoading}
                                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Trash2 size={16} />
                                                Remove photo
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <h2 className="text-xl font-bold mt-2">
                            {hasText(profile?.name) ? profile.name : "Name not added"}
                        </h2>
                        {hasText(profile?.title) && <p className="text-gray-600">{profile.title}</p>}

                        {isProfileImageActionLoading && <p className="mt-3 text-xs text-gray-500">Updating profile picture...</p>}
                        {profileImageError && <p className="mt-3 text-xs text-red-600">{profileImageError}</p>}

                        {profileImageError && (
                            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" role="presentation">
                                <div
                                    role="alertdialog"
                                    aria-modal="true"
                                    aria-labelledby="profile-image-error-title"
                                    className="w-full max-w-sm rounded-xl border border-red-200 bg-white p-5 text-left shadow-2xl"
                                >
                                    <h3 id="profile-image-error-title" className="text-base font-bold text-red-700">
                                        Profile picture could not be updated
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600">{profileImageError}</p>
                                    <button
                                        type="button"
                                        onClick={() => setProfileImageError("")}
                                        className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {profileImageCrop && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation">
                                <div
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="crop-profile-picture-title"
                                    className="w-full max-w-md rounded-xl bg-white p-6 text-left shadow-2xl"
                                >
                                    <h3 id="crop-profile-picture-title" className="text-lg font-bold text-gray-900">
                                        Adjust profile picture
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Drag the photo until the part you want is inside the circle.
                                    </p>

                                    <div
                                        className="mx-auto mt-5 h-[280px] w-[280px] touch-none cursor-grab overflow-hidden bg-gray-200 ring-4 ring-gray-100 active:cursor-grabbing"
                                        onPointerDown={handleProfileImageCropPointerDown}
                                        onPointerMove={handleProfileImageCropPointerMove}
                                        onPointerUp={handleProfileImageCropPointerUp}
                                        onPointerCancel={handleProfileImageCropPointerUp}
                                    >
                                        <div className="relative h-full w-full">
                                            <img
                                                src={profileImageCrop.url}
                                                alt="Profile picture crop preview"
                                                draggable="false"
                                                onDragStart={(event) => event.preventDefault()}
                                                onLoad={(event) => setProfileImageCropSize({
                                                    width: event.currentTarget.naturalWidth,
                                                    height: event.currentTarget.naturalHeight,
                                                })}
                                                className="pointer-events-none absolute max-w-none select-none"
                                                style={profileImageCropLayout ? {
                                                    width: profileImageCropLayout.width,
                                                    height: profileImageCropLayout.height,
                                                    left: profileImageCropLayout.left,
                                                    top: profileImageCropLayout.top,
                                                } : { visibility: "hidden" }}
                                            />
                                            {profileImageCropLayout && (
                                                <>
                                                    <div
                                                        className="pointer-events-none absolute rounded-full border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
                                                        style={{
                                                            width: profileImageCropLayout.selectionSize,
                                                            height: profileImageCropLayout.selectionSize,
                                                            left: profileImageCropLayout.selectionLeft,
                                                            top: profileImageCropLayout.selectionTop,
                                                        }}
                                                    />
                                                    {[
                                                        { corner: "topLeft", label: "Resize crop from top left", left: profileImageCropLayout.selectionLeft - 12, top: profileImageCropLayout.selectionTop - 12, border: "border-l-4 border-t-4", cursor: "cursor-nwse-resize" },
                                                        { corner: "topRight", label: "Resize crop from top right", left: profileImageCropLayout.selectionLeft + profileImageCropLayout.selectionSize - 12, top: profileImageCropLayout.selectionTop - 12, border: "border-r-4 border-t-4", cursor: "cursor-nesw-resize" },
                                                        { corner: "bottomLeft", label: "Resize crop from bottom left", left: profileImageCropLayout.selectionLeft - 12, top: profileImageCropLayout.selectionTop + profileImageCropLayout.selectionSize - 12, border: "border-l-4 border-b-4", cursor: "cursor-nesw-resize" },
                                                        { corner: "bottomRight", label: "Resize crop from bottom right", left: profileImageCropLayout.selectionLeft + profileImageCropLayout.selectionSize - 12, top: profileImageCropLayout.selectionTop + profileImageCropLayout.selectionSize - 12, border: "border-r-4 border-b-4", cursor: "cursor-nwse-resize" },
                                                    ].map((handle) => (
                                                        <button
                                                            key={handle.corner}
                                                            type="button"
                                                            aria-label={handle.label}
                                                            onPointerDown={(event) => handleProfileImageCropResizePointerDown(event, handle.corner)}
                                                            onKeyDown={handleProfileImageCropResizeKeyDown}
                                                            className={`pointer-events-auto absolute z-10 h-6 w-6 rounded-sm border-white bg-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] ${handle.border} ${handle.cursor}`}
                                                            style={{ left: handle.left, top: handle.top }}
                                                        />
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <label className="mt-5 block text-sm font-medium text-gray-700" htmlFor="profile-picture-size">
                                        Crop circle size
                                    </label>
                                    <input
                                        id="profile-picture-size"
                                        type="range"
                                        min="140"
                                        max="280"
                                        step="1"
                                        value={profileImageCropSelectionSize}
                                        onChange={(event) => setProfileImageCropSelectionSize(Number(event.target.value))}
                                        className="mt-2 w-full accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Smaller crop</span>
                                        <span>Larger crop</span>
                                    </div>
                                    <p className="mt-4 text-center text-xs text-gray-500">
                                        The circular area is the part that will appear on your profile.
                                    </p>
                                    <div className="mt-6 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={closeProfileImageCrop}
                                            disabled={isProfileImageActionLoading}
                                            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={confirmProfileImageCrop}
                                            disabled={!profileImageCropLayout || isProfileImageActionLoading}
                                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isProfileImageActionLoading ? "Saving..." : "Use this photo"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isProfileImageDeleteConfirmOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
                                <div
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="delete-profile-picture-title"
                                    className="w-full max-w-sm rounded-xl bg-white p-6 text-left shadow-2xl"
                                >
                                    <h3 id="delete-profile-picture-title" className="text-lg font-bold text-gray-900">
                                        Remove profile picture?
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Your profile picture will be deleted and your profile will show the default picture instead.
                                    </p>
                                    <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Default profile picture preview
                                        </p>
                                        <img
                                            src={defaultProfileImage}
                                            alt="The default profile picture that will appear after removal"
                                            className="mx-auto mt-3 h-24 w-24 rounded-full object-cover ring-4 ring-white"
                                        />
                                        <p className="mt-3 text-sm font-medium text-gray-700">
                                            This is what your profile will show after removal.
                                        </p>
                                    </div>
                                    <div className="mt-6 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsProfileImageDeleteConfirmOpen(false)}
                                            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={confirmDeleteProfileImage}
                                            disabled={isProfileImageActionLoading}
                                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isProfileImageActionLoading ? "Removing..." : "Remove photo"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 text-left space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Mail size={16} />
                                <span>{hasText(profile?.email) ? profile.email : "Email not added"}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Phone size={16} />
                                <span>{hasText(profile?.phone) ? profile.phone : "Phone not added"}</span>
                            </div>

                            {hasText(profile?.location) && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    <span>{profile.location}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 text-left">
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <h3 className="flex items-center gap-2 font-semibold">
                                    <Award size={18} /> Skills
                                </h3>
                                {canEdit && (
                                    <button
                                        type="button"
                                        onClick={openSkillsModal}
                                        aria-label="Edit skills"
                                        title="Edit skills"
                                        className="rounded-md p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(profile?.skills) && profile.skills.length > 0 ? (
                                    profile.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                                        >
                                            {skill}

                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No skills added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="flex items-center gap-2 text-lg font-bold">
                                    <User size={18} /> About
                                </h3>
                                {canEdit && (
                                    <button type="button" onClick={() => openEditor("about")} aria-label="Edit about" title="Edit about" className="rounded-md p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700">
                                        <Pencil size={17} />
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-700">
                                {hasText(profile?.summary) ? profile.summary : "No summary added yet."}
                            </p>
                        </div>

                        {!resumeUrl && canEdit && onUploadResume && (
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50">
                                <div className="rounded-full bg-gray-200 p-3 text-gray-500">
                                    <FileText size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-gray-700">Upload your resume</h3>
                                    <p className="mt-1 text-sm text-gray-500">Add a resume so employers can learn more about your experience.</p>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100">
                                    <Upload size={16} />
                                    {isResumeActionLoading ? "Uploading..." : "Choose file"}
                                </span>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt,.rtf"
                                    onChange={handleUploadResume}
                                    disabled={isResumeActionLoading}
                                    className="sr-only"
                                />
                                <p className="text-xs text-gray-400">PDF, Word, TXT, or RTF. Maximum size: 5MB.</p>
                                {resumeUploadError && <p className="text-sm text-red-600">{resumeUploadError}</p>}
                            </label>
                        )}

                        {resumeUrl && (
                            <div className="bg-white p-6 rounded-xl shadow">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                                            <FileText size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-500">Resume</p>
                                            <p className="truncate text-base font-semibold text-gray-800">{resumeName}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={handleOpenResume}
                                            disabled={isResumeActionLoading}
                                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
                                        >
                                            <Eye size={16} /> {isResumeActionLoading ? "Loading..." : "Preview"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDownloadResume}
                                            disabled={isResumeActionLoading}
                                            className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm hover:bg-gray-300"
                                        >
                                            <Download size={16} /> Download
                                        </button>
                                        {onDeleteResume && (
                                            <button
                                                type="button"
                                                onClick={handleDeleteResume}
                                                disabled={isResumeActionLoading}
                                                className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isResumePreviewOpen && (
                                    <div className="fixed inset-x-0 bottom-0 top-16 z-[60] flex items-center justify-center bg-black/80 p-4 sm:p-6">
                                        <div className="flex h-full max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                                            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                                                <div className="min-w-0 flex-1 text-sm font-medium text-gray-800 truncate">{activeResumeName}</div>
                                                <div className="ml-4 flex items-center gap-2">
                                                    <a
                                                        href={activeResumeUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                                    >
                                                        Open in new tab
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsResumePreviewOpen(false)}
                                                        className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>

                                            {isPdfResume ? (
                                                <iframe
                                                    title="Resume preview overlay"
                                                    src={activeResumeUrl}
                                                    className="h-full w-full bg-white"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-gray-50 p-6">
                                                    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center shadow-sm">
                                                        <p className="mb-3 text-gray-600">This file type is best viewed in a new tab.</p>
                                                        <a
                                                            href={activeResumeUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                        >
                                                            <Eye size={16} /> Open Resume
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-xl shadow">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="flex items-center gap-2 text-lg font-bold">
                                    <GraduationCap size={18} /> Education
                                </h3>
                                {canEdit && (
                                    <button type="button" onClick={() => openEditor("education")} aria-label="Add education" title="Add education" className="rounded-md p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700">
                                        <Plus size={19} />
                                    </button>
                                )}
                            </div>

                            {Array.isArray(profile?.education) && profile.education.length > 0 ? (
                                profile.education.map((edu, index) => (
                                    <div key={index} className={`relative mb-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm${canEdit ? " pr-12" : ""}`}>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <h4 className="font-semibold text-slate-900">{hasText(edu?.degree) ? edu.degree : "Degree not added"}</h4>
                                                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                    {formatMonthYear(edu?.year, "Year not added")}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-600">{hasText(edu?.institution) ? edu.institution : "Institution not added"}</p>
                                        </div>
                                        {canEdit && (
                                            <button type="button" onClick={() => openEditor("education", index)} aria-label={`Edit education ${index + 1}`} title="Edit education" className="absolute right-3 top-3 rounded-md p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700">
                                                <Pencil size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No education details added yet.</p>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="flex items-center gap-2 text-lg font-bold"><Briefcase size={18} /> Experience</h3>
                                {canEdit && <button type="button" onClick={() => openEditor("experience")} aria-label="Add experience" title="Add experience" className="rounded-md p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700"><Plus size={19} /></button>}
                            </div>

                            {Array.isArray(profile?.experience) && profile.experience.length > 0 ? (
                                profile.experience.map((exp, index) => (
                                    <div key={index} className={`relative mb-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm${canEdit ? " pr-12" : ""}`}>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <h4 className="font-semibold text-slate-900">{hasText(exp?.title) ? exp.title : "Role not added"}</h4>
                                                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                    {formatMonthYear(exp?.start, "Start not added")} - {exp?.current ? "Present" : formatMonthYear(exp?.end, "Present")}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-600">{hasText(exp?.institution) ? exp.institution : "Organization not added"}</p>
                                            {formatExperienceDuration(exp?.start, exp?.end, exp?.current) && (
                                                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                                                    {formatExperienceDuration(exp?.start, exp?.end, exp?.current)}
                                                </p>
                                            )}
                                            {hasText(exp?.description) && <p className="mt-3 text-sm leading-6 text-slate-700">{exp.description}</p>}
                                        </div>
                                        {canEdit && <button type="button" onClick={() => openEditor("experience", index)} aria-label={`Edit experience ${index + 1}`} title="Edit experience" className="absolute right-3 top-3 rounded-md p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700"><Pencil size={16} /></button>}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No work experience added yet.</p>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="flex items-center gap-2 text-lg font-bold"><BookOpen size={18} /> Publications</h3>
                                {canEdit && <button type="button" onClick={() => openEditor("publications")} aria-label="Add publication" title="Add publication" className="rounded-md p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700"><Plus size={19} /></button>}
                            </div>

                            {Array.isArray(profile?.publications) && profile.publications.length > 0 ? (
                                profile.publications.map((pub, index) => (
                                    <div key={index} className={`relative mb-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm${canEdit ? " pr-12" : ""}`}>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-slate-900">{hasText(pub?.title) ? pub.title : "Untitled publication"}</h4>
                                            {hasText(pub?.description) && <p className="mt-2 text-sm leading-6 text-slate-700">{pub.description}</p>}

                                            {hasText(pub?.link) && (
                                                <a
                                                    href={pub.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
                                                >
                                                    <LinkIcon size={14} /> View publication
                                                </a>
                                            )}
                                        </div>
                                        {canEdit && <button type="button" onClick={() => openEditor("publications", index)} aria-label={`Edit publication ${index + 1}`} title="Edit publication" className="absolute right-3 top-3 rounded-md p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700"><Pencil size={16} /></button>}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No publications added yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isSkillsModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" role="presentation">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 text-left shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="skills-editor-title">
                        <div className="flex items-center justify-between gap-4">
                            <h2 id="skills-editor-title" className="text-xl font-bold text-gray-900">
                                Edit Skills
                            </h2>
                            <button type="button" onClick={closeSkillsModal} aria-label="Close dialog" title="Close" className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 flex gap-2">
                            <input
                                type="text"
                                value={newSkillValue}
                                onChange={(event) => setNewSkillValue(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        addSkill();
                                    }
                                }}
                                placeholder="Add a new skill"
                                className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Plus size={16} /> Add
                            </button>
                        </div>

                        {skillsError && <p className="mt-2 text-sm text-red-600">{skillsError}</p>}

                        <div className="mt-5 max-h-72 space-y-2 overflow-y-auto">
                            {draftSkills.length > 0 ? (
                                draftSkills.map((skill, index) => (
                                    <div key={index} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                                        {editingSkillIndex === index ? (
                                            <>
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={editingSkillValue}
                                                    onChange={(event) => setEditingSkillValue(event.target.value)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Enter") {
                                                            event.preventDefault();
                                                            confirmEditSkill();
                                                        } else if (event.key === "Escape") {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            cancelEditSkill();
                                                        }
                                                    }}
                                                    className="flex-1 rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={confirmEditSkill}
                                                    aria-label={`Save skill ${skill}`}
                                                    title="Save"
                                                    className="rounded-md p-1.5 text-green-600 hover:bg-green-50"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEditSkill}
                                                    aria-label="Cancel editing skill"
                                                    title="Cancel"
                                                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="flex-1 truncate text-sm text-gray-800">{skill}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => startEditSkill(index)}
                                                    aria-label={`Edit skill ${skill}`}
                                                    title="Edit"
                                                    className="rounded-md p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteSkill(index)}
                                                    aria-label={`Delete skill ${skill}`}
                                                    title="Delete"
                                                    className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No skills added yet.</p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeSkillsModal}
                                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={saveSkillsModal}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeEditor && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" role="presentation">
                    <div className="w-full max-w-xl rounded-xl bg-white p-6 text-left shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="profile-section-editor-title">
                        <div className="flex items-center justify-between gap-4">
                            <h2 id="profile-section-editor-title" className="text-xl font-bold text-gray-900">
                                {activeEditor === "personal"
                                    ? "Edit Personal Details"
                                    : activeEditor === "about"
                                        ? "Edit About"
                                        : editorIndex === null
                                            ? `Add ${activeEditor === "publications" ? "Publication" : activeEditor.charAt(0).toUpperCase() + activeEditor.slice(1)}`
                                            : `Change ${activeEditor === "publications" ? "Publication" : activeEditor.charAt(0).toUpperCase() + activeEditor.slice(1)}`}
                            </h2>
                            <button type="button" onClick={closeEditor} aria-label="Close dialog" title="Close" className="rounded-md p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
                        </div>

                        <div className="mt-5 space-y-4">
                            {activeEditor === "personal" && (
                                <>
                                    <label className="block space-y-1 text-sm font-medium text-gray-700">
                                        Name
                                        <input
                                            type="text"
                                            value={editorForm.name || ""}
                                            onChange={(event) => setEditorForm((prev) => ({ ...prev, name: event.target.value }))}
                                            placeholder="e.g. Dr. Jane Doe"
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </label>
                                    <label className="block space-y-1 text-sm font-medium text-gray-700">
                                        Title
                                        <input
                                            type="text"
                                            value={editorForm.title || ""}
                                            onChange={(event) => setEditorForm((prev) => ({ ...prev, title: event.target.value }))}
                                            placeholder="e.g. Associate Professor of Computer Science"
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </label>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <label className="block space-y-1 text-sm font-medium text-gray-700">
                                            Email
                                            <input
                                                type="email"
                                                value={editorForm.email || ""}
                                                onChange={(event) => setEditorForm((prev) => ({ ...prev, email: event.target.value }))}
                                                placeholder="e.g. jane.doe@university.edu"
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </label>
                                        <label className="block space-y-1 text-sm font-medium text-gray-700">
                                            Phone
                                            <input
                                                type="tel"
                                                value={editorForm.phone || ""}
                                                onChange={(event) => setEditorForm((prev) => ({ ...prev, phone: event.target.value }))}
                                                placeholder="e.g. +1 555-0199"
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </label>
                                    </div>
                                    <label className="block space-y-1 text-sm font-medium text-gray-700">
                                        Location
                                        <input
                                            type="text"
                                            value={editorForm.location || ""}
                                            onChange={(event) => setEditorForm((prev) => ({ ...prev, location: event.target.value }))}
                                            placeholder="e.g. Boston, MA"
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </label>
                                </>
                            )}

                            {activeEditor === "about" && (
                                <label className="block space-y-1 text-sm font-medium text-gray-700">
                                    About
                                    <textarea value={editorForm.summary || ""} onChange={(event) => setEditorForm((prev) => ({ ...prev, summary: event.target.value }))} rows={5} placeholder="Write a short summary" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                                </label>
                            )}

                            {(activeEditor === "education" || activeEditor === "experience" || activeEditor === "publications") && (
                                <>
                                    {activeEditor === "education" && (
                                        <>
                                            <label className="block space-y-1 text-sm font-medium text-gray-700">Degree or qualification<input value={editorForm.degree || ""} onChange={(event) => setEditorForm((prev) => ({ ...prev, degree: event.target.value }))} placeholder="e.g. Ph.D. in Physics" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                                            <label className="block space-y-1 text-sm font-medium text-gray-700">Institution<input value={editorForm.institution || ""} onChange={(event) => setEditorForm((prev) => ({ ...prev, institution: event.target.value }))} placeholder="University or college" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                                            <label className="block space-y-1 text-sm font-medium text-gray-700">Graduation year<input value={editorForm.year || ""} onChange={(event) => setEditorForm((prev) => ({ ...prev, year: event.target.value }))} placeholder="YYYY-MM" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                                        </>
                                    )}
                                    {activeEditor === "experience" && (
                                        <>
                                            <label className="block space-y-1 text-sm font-medium text-gray-700">Role or job title<input value={editorForm.title || ""} onChange={(event) => setEditorForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="e.g. Assistant Professor" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                                            <label className="block space-y-1 text-sm font-medium text-gray-700">Institution<input value={editorForm.institution || ""} onChange={(event) => setEditorForm((prev) => ({ ...prev, institution: event.target.value }))} placeholder="University or organization" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block space-y-1 text-sm font-medium text-gray-700">Start date<input value={editorForm.start || ""} onChange={(event) => setEditorForm((prev) => ({ ...prev, start: event.target.value }))} placeholder="YYYY-MM" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label><label className="block space-y-1 text-sm font-medium text-gray-700">End date<input value={editorForm.end || ""} onChange={(event) => setEditorForm((prev) => ({ ...prev, end: event.target.value }))} placeholder="YYYY-MM or Present" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label></div>
                                            <label className="block space-y-1 text-sm font-medium text-gray-700">Description<textarea value={editorForm.description || ""} onChange={(event) => setEditorForm((prev) => ({ ...prev, description: event.target.value }))} rows={4} placeholder="Summarize your responsibilities or achievements" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                                        </>
                                    )}
                                    {activeEditor === "publications" && (
                                        <>
                                            <label className="block space-y-1 text-sm font-medium text-gray-700">Publication title<input value={editorForm.title || ""} onChange={(event) => setEditorForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title of your paper or work" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                                            <label className="block space-y-1 text-sm font-medium text-gray-700">Link<input type="url" value={editorForm.link || ""} onChange={(event) => setEditorForm((prev) => ({ ...prev, link: event.target.value }))} placeholder="https://doi.org/..." className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                                            <label className="block space-y-1 text-sm font-medium text-gray-700">Description<textarea value={editorForm.description || ""} onChange={(event) => setEditorForm((prev) => ({ ...prev, description: event.target.value }))} rows={4} placeholder="Add a short description or abstract" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        {editorError && <p className="mt-3 text-sm text-red-600">{editorError}</p>}
                        <div className="mt-6 flex items-center justify-between gap-2">
                            {editorIndex !== null && activeEditor !== "about" && activeEditor !== "personal" ? (
                                <button type="button" onClick={deleteEditorEntry} className="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200">Delete</button>
                            ) : <span />}
                            <div className="flex gap-2">
                                <button type="button" onClick={closeEditor} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Cancel</button>
                                <button type="button" onClick={saveEditor} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditableProfile;
