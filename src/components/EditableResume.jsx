import { useState } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Pencil,
    Save,
    X,
    GraduationCap,
    Briefcase,
    BookOpen,
    Award,
    Plus,
    Trash2,
    Link as LinkIcon,
    Camera,
} from "lucide-react";

const EditableResume = ({
    resume,
    setResume,
    isEditing,
    setIsEditing,
    onSave,
    canEdit,
    pageTitle = "Resume",
    showBackButton = false,
    onBack,
}) => {
    const [newSkill, setNewSkill] = useState("");
    const [newEducation, setNewEducation] = useState({ degree: "", institution: "", year: "" });
    const [newExperience, setNewExperience] = useState({
        title: "",
        institution: "",
        start: "",
        end: "",
        description: "",
    });
    const [newPublication, setNewPublication] = useState({ title: "", description: "", link: "" });

    const hasText = (value) => typeof value === "string" && value.trim().length > 0;

    const updateResumeField = (name, value) => {
        setResume((prev) => ({ ...prev, [name]: value }));
    };

    const updateListItem = (listName, index, field, value) => {
        setResume((prev) => {
            const list = Array.isArray(prev[listName]) ? [...prev[listName]] : [];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [listName]: list };
        });
    };

    const removeListItem = (listName, index) => {
        setResume((prev) => ({
            ...prev,
            [listName]: (Array.isArray(prev[listName]) ? prev[listName] : []).filter((_, i) => i !== index),
        }));
    };

    const addSkill = () => {
        if (!hasText(newSkill)) {
            return;
        }

        setResume((prev) => ({
            ...prev,
            skills: [...(Array.isArray(prev.skills) ? prev.skills : []), newSkill.trim()],
        }));
        setNewSkill("");
    };

    const addEducation = () => {
        if (!hasText(newEducation.degree) || !hasText(newEducation.institution)) {
            return;
        }

        setResume((prev) => ({
            ...prev,
            education: [...(Array.isArray(prev.education) ? prev.education : []), newEducation],
        }));

        setNewEducation({ degree: "", institution: "", year: "" });
    };

    const addExperience = () => {
        if (!hasText(newExperience.title) || !hasText(newExperience.institution)) {
            return;
        }

        setResume((prev) => ({
            ...prev,
            experience: [...(Array.isArray(prev.experience) ? prev.experience : []), newExperience],
        }));

        setNewExperience({ title: "", institution: "", start: "", end: "", description: "" });
    };

    const addPublication = () => {
        if (!hasText(newPublication.title)) {
            return;
        }

        setResume((prev) => ({
            ...prev,
            publications: [...(Array.isArray(prev.publications) ? prev.publications : []), newPublication],
        }));

        setNewPublication({ title: "", description: "", link: "" });
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-6 pt-4 pb-2 flex justify-between items-center">
                {showBackButton ? (
                    <button
                        onClick={onBack}
                        className="bg-gray-200 hover:bg-gray-300 text-white py-2 px-4 rounded-md shadow"
                    >
                        Go Back
                    </button>
                ) : (
                    <div></div>
                )}

                {canEdit && (
                    isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-1 text-gray-700 bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-md"
                            >
                                <X size={16} /> Cancel
                            </button>

                            <button
                                onClick={onSave}
                                className="flex items-center gap-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                            >
                                <Save size={16} /> Save
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1 text-white bg-blue-600 py-2 px-4 rounded-md hover:bg-blue-700"
                        >
                            <Pencil size={16} /> Edit
                        </button>
                    )
                )}
            </div>

            <div className="w-full px-6">
                <div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 pb-10">
                <div className={`flex flex-col md:flex-row gap-6 -mt-20`}>
                    <div className="w-full md:w-1/3 bg-white rounded-xl shadow p-6 text-center">
                        <img
                            src={resume?.profileImage || "/assets/default-profile.jpg"}
                            alt={hasText(resume?.name) ? resume.name : "Profile"}
                            className="w-32 h-32 rounded-full mx-auto border-4 border-white object-cover"
                        />

                        {isEditing ? (
                            <div className="space-y-2 mt-4 text-left">
                                <input
                                    value={resume?.name || ""}
                                    onChange={(e) => updateResumeField("name", e.target.value)}
                                    className="border p-2 w-full rounded"
                                    placeholder="Full name"
                                />
                                <input
                                    value={resume?.title || ""}
                                    onChange={(e) => updateResumeField("title", e.target.value)}
                                    className="border p-2 w-full rounded"
                                    placeholder="Title"
                                />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold mt-4">
                                    {hasText(resume?.name) ? resume.name : "Name not added"}
                                </h2>
                                <p className="text-gray-600">{hasText(resume?.title) ? resume.title : "Title not added"}</p>
                            </>
                        )}

                        {isEditing && (
                            <button className="flex items-center gap-2 mx-auto mt-3 text-sm text-blue-600">
                                <Camera size={16} /> Change Photo
                            </button>
                        )}

                        <div className="mt-6 text-left space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Mail size={16} />
                                {isEditing ? (
                                    <input
                                        value={resume?.email || ""}
                                        onChange={(e) => updateResumeField("email", e.target.value)}
                                        className="border p-2 w-full rounded"
                                        placeholder="Email"
                                    />
                                ) : (
                                    <span>{hasText(resume?.email) ? resume.email : "Email not added"}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Phone size={16} />
                                {isEditing ? (
                                    <input
                                        value={resume?.phone || ""}
                                        onChange={(e) => updateResumeField("phone", e.target.value)}
                                        className="border p-2 w-full rounded"
                                        placeholder="Phone"
                                    />
                                ) : (
                                    <span>{hasText(resume?.phone) ? resume.phone : "Phone not added"}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <MapPin size={16} />
                                {isEditing ? (
                                    <input
                                        value={resume?.location || ""}
                                        onChange={(e) => updateResumeField("location", e.target.value)}
                                        className="border p-2 w-full rounded"
                                        placeholder="Location"
                                    />
                                ) : (
                                    <span>{hasText(resume?.location) ? resume.location : "Location not added"}</span>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 text-left">
                            <h3 className="flex items-center gap-2 font-semibold mb-2">
                                <Award size={18} /> Skills
                            </h3>

                            {isEditing && (
                                <div className="flex gap-2 mb-3">
                                    <input
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        className="border p-2 flex-1 rounded"
                                        placeholder="Add skill"
                                    />

                                    <button
                                        onClick={addSkill}
                                        className="bg-blue-600 text-white px-3 rounded flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Add
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(resume?.skills) && resume.skills.length > 0 ? (
                                    resume.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                                        >
                                            {skill}

                                            {isEditing && (
                                                <button onClick={() => removeListItem("skills", index)}>
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
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
                            <h3 className="flex items-center gap-2 text-lg font-bold mb-3">
                                <User size={18} /> {pageTitle}
                            </h3>

                            {isEditing ? (
                                <textarea
                                    value={resume?.summary || ""}
                                    onChange={(e) => updateResumeField("summary", e.target.value)}
                                    className="w-full border p-3 rounded"
                                    placeholder="Write a short summary"
                                />
                            ) : (
                                <p className="text-gray-700">
                                    {hasText(resume?.summary) ? resume.summary : "No summary added yet."}
                                </p>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow">
                            <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
                                <GraduationCap size={18} /> Education
                            </h3>

                            {isEditing && (
                                <div className="space-y-2 mb-4">
                                    <input
                                        value={newEducation.degree}
                                        onChange={(e) => setNewEducation((prev) => ({ ...prev, degree: e.target.value }))}
                                        placeholder="Degree"
                                        className="border p-2 w-full rounded"
                                    />
                                    <input
                                        value={newEducation.institution}
                                        onChange={(e) => setNewEducation((prev) => ({ ...prev, institution: e.target.value }))}
                                        placeholder="Institution"
                                        className="border p-2 w-full rounded"
                                    />
                                    <input
                                        value={newEducation.year}
                                        onChange={(e) => setNewEducation((prev) => ({ ...prev, year: e.target.value }))}
                                        placeholder="Year"
                                        className="border p-2 w-full rounded"
                                    />

                                    <button onClick={addEducation} className="bg-blue-600 text-white px-4 py-2 rounded">
                                        Add Education
                                    </button>
                                </div>
                            )}

                            {Array.isArray(resume?.education) && resume.education.length > 0 ? (
                                resume.education.map((edu, index) => (
                                    <div key={index} className="border-l-4 border-indigo-500 pl-4 mb-4 flex justify-between gap-2">
                                        {isEditing ? (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                                                <input
                                                    value={edu?.degree || ""}
                                                    onChange={(e) => updateListItem("education", index, "degree", e.target.value)}
                                                    className="border p-2 rounded"
                                                    placeholder="Degree"
                                                />
                                                <input
                                                    value={edu?.institution || ""}
                                                    onChange={(e) => updateListItem("education", index, "institution", e.target.value)}
                                                    className="border p-2 rounded"
                                                    placeholder="Institution"
                                                />
                                                <input
                                                    value={edu?.year || ""}
                                                    onChange={(e) => updateListItem("education", index, "year", e.target.value)}
                                                    className="border p-2 rounded"
                                                    placeholder="Year"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="font-semibold">{hasText(edu?.degree) ? edu.degree : "Degree not added"}</h4>
                                                <p className="text-gray-600">{hasText(edu?.institution) ? edu.institution : "Institution not added"}</p>
                                                <p className="text-sm text-gray-500">{hasText(edu?.year) ? edu.year : "Year not added"}</p>
                                            </div>
                                        )}

                                        {isEditing && (
                                            <button
                                                onClick={() => removeListItem("education", index)}
                                                className="text-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No education details added yet.</p>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow">
                            <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
                                <Briefcase size={18} /> Experience
                            </h3>

                            {isEditing && (
                                <div className="space-y-2 mb-4">
                                    <input
                                        value={newExperience.title}
                                        onChange={(e) => setNewExperience((prev) => ({ ...prev, title: e.target.value }))}
                                        placeholder="Job title"
                                        className="border p-2 w-full rounded"
                                    />
                                    <input
                                        value={newExperience.institution}
                                        onChange={(e) => setNewExperience((prev) => ({ ...prev, institution: e.target.value }))}
                                        placeholder="Institution"
                                        className="border p-2 w-full rounded"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <input
                                            value={newExperience.start}
                                            onChange={(e) => setNewExperience((prev) => ({ ...prev, start: e.target.value }))}
                                            placeholder="Start"
                                            className="border p-2 w-full rounded"
                                        />
                                        <input
                                            value={newExperience.end}
                                            onChange={(e) => setNewExperience((prev) => ({ ...prev, end: e.target.value }))}
                                            placeholder="End"
                                            className="border p-2 w-full rounded"
                                        />
                                    </div>
                                    <textarea
                                        value={newExperience.description}
                                        onChange={(e) => setNewExperience((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder="Description"
                                        className="border p-2 w-full rounded"
                                    />

                                    <button onClick={addExperience} className="bg-blue-600 text-white px-4 py-2 rounded">
                                        Add Experience
                                    </button>
                                </div>
                            )}

                            {Array.isArray(resume?.experience) && resume.experience.length > 0 ? (
                                resume.experience.map((exp, index) => (
                                    <div key={index} className="border-l-4 border-indigo-500 pl-4 mb-4 flex justify-between gap-2">
                                        {isEditing ? (
                                            <div className="space-y-2 w-full">
                                                <input
                                                    value={exp?.title || ""}
                                                    onChange={(e) => updateListItem("experience", index, "title", e.target.value)}
                                                    className="border p-2 w-full rounded"
                                                    placeholder="Job title"
                                                />
                                                <input
                                                    value={exp?.institution || ""}
                                                    onChange={(e) => updateListItem("experience", index, "institution", e.target.value)}
                                                    className="border p-2 w-full rounded"
                                                    placeholder="Institution"
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <input
                                                        value={exp?.start || ""}
                                                        onChange={(e) => updateListItem("experience", index, "start", e.target.value)}
                                                        className="border p-2 w-full rounded"
                                                        placeholder="Start"
                                                    />
                                                    <input
                                                        value={exp?.end || ""}
                                                        onChange={(e) => updateListItem("experience", index, "end", e.target.value)}
                                                        className="border p-2 w-full rounded"
                                                        placeholder="End"
                                                    />
                                                </div>
                                                <textarea
                                                    value={exp?.description || ""}
                                                    onChange={(e) => updateListItem("experience", index, "description", e.target.value)}
                                                    className="border p-2 w-full rounded"
                                                    placeholder="Description"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="font-semibold">{hasText(exp?.title) ? exp.title : "Role not added"}</h4>
                                                <p className="text-gray-600">{hasText(exp?.institution) ? exp.institution : "Organization not added"}</p>
                                                <p className="text-sm text-gray-500">
                                                    {hasText(exp?.start) ? exp.start : "Start not added"} - {hasText(exp?.end) ? exp.end : "Present"}
                                                </p>
                                                <p className="text-gray-700 mt-1">{hasText(exp?.description) ? exp.description : ""}</p>
                                            </div>
                                        )}

                                        {isEditing && (
                                            <button
                                                onClick={() => removeListItem("experience", index)}
                                                className="text-red-500 flex items-center gap-1"
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No work experience added yet.</p>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow">
                            <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
                                <BookOpen size={18} /> Publications
                            </h3>

                            {isEditing && (
                                <div className="space-y-2 mb-4">
                                    <input
                                        value={newPublication.title}
                                        onChange={(e) => setNewPublication((prev) => ({ ...prev, title: e.target.value }))}
                                        placeholder="Title"
                                        className="border p-2 w-full rounded"
                                    />
                                    <input
                                        value={newPublication.description}
                                        onChange={(e) => setNewPublication((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder="Description"
                                        className="border p-2 w-full rounded"
                                    />
                                    <input
                                        value={newPublication.link}
                                        onChange={(e) => setNewPublication((prev) => ({ ...prev, link: e.target.value }))}
                                        placeholder="Link"
                                        className="border p-2 w-full rounded"
                                    />

                                    <button onClick={addPublication} className="bg-blue-600 text-white px-4 py-2 rounded">
                                        Add Publication
                                    </button>
                                </div>
                            )}

                            {Array.isArray(resume?.publications) && resume.publications.length > 0 ? (
                                resume.publications.map((pub, index) => (
                                    <div key={index} className="border p-4 rounded mb-3 flex justify-between gap-2">
                                        {isEditing ? (
                                            <div className="space-y-2 w-full">
                                                <input
                                                    value={pub?.title || ""}
                                                    onChange={(e) => updateListItem("publications", index, "title", e.target.value)}
                                                    className="border p-2 w-full rounded"
                                                    placeholder="Title"
                                                />
                                                <input
                                                    value={pub?.description || ""}
                                                    onChange={(e) => updateListItem("publications", index, "description", e.target.value)}
                                                    className="border p-2 w-full rounded"
                                                    placeholder="Description"
                                                />
                                                <input
                                                    value={pub?.link || ""}
                                                    onChange={(e) => updateListItem("publications", index, "link", e.target.value)}
                                                    className="border p-2 w-full rounded"
                                                    placeholder="Link"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="font-semibold">{hasText(pub?.title) ? pub.title : "Untitled publication"}</h4>
                                                <p className="text-gray-600">{hasText(pub?.description) ? pub.description : ""}</p>

                                                {hasText(pub?.link) && (
                                                    <a
                                                        href={pub.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 flex items-center gap-1 text-sm"
                                                    >
                                                        <LinkIcon size={14} /> Visit
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {isEditing && (
                                            <button
                                                onClick={() => removeListItem("publications", index)}
                                                className="text-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No publications added yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditableResume;
