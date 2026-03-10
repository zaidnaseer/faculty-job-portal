import { useState } from "react";
import VideoUploader from "./VideoUploader";
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
Link,
Camera
} from "lucide-react";

import RippleBackground from "../components/RippleBackground";

const ResumeEditor = ({ initialResume, userId }) => {

const [resume, setResume] = useState(initialResume || {
name: "",
title: "",
email: "",
phone: "",
location: "",
summary: "",
education: [],
experience: [],
skills: [],
publications: [],
profileImage: "",
introVideo: ""
});

const [newSkill, setNewSkill] = useState("");
const [newPublication, setNewPublication] = useState({ title: "", description: "", link: "" });
const [newExperience, setNewExperience] = useState({ title: "", institution: "", start: "", end: "", description: "", current: false });

const [isEditing, setIsEditing] = useState(false);
const [expError, setExpError] = useState("");
const [expAdded, setExpAdded] = useState(false);

const handleChange = (e) => {
const { name, value } = e.target;
setResume(prev => ({ ...prev, [name]: value }));
};

const handleSkillInputChange = (e) => setNewSkill(e.target.value);

const handleAddSkill = () => {
if (newSkill.trim()) {
setResume(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
setNewSkill("");
}
};

const handleRemoveSkill = (index) => {
setResume(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
};

const handlePublicationInputChange = (e) => {
const { name, value } = e.target;
setNewPublication(prev => ({ ...prev, [name]: value }));
};

const handleAddPublication = () => {
if (newPublication.title.trim()) {
setResume(prev => ({
...prev,
publications: [...prev.publications, newPublication]
}));
setNewPublication({ title: "", description: "", link: "" });
}
};

const handleRemovePublication = (index) => {
setResume(prev => ({
...prev,
publications: prev.publications.filter((_, i) => i !== index)
}));
};

const handleExperienceInputChange = (e) => {
const { name, value, type, checked } = e.target;
setNewExperience(prev => ({
...prev,
[name]: type === "checkbox" ? checked : value
}));
};

const handleAddExperience = () => {
setExpError("");

if (!newExperience.title || !newExperience.institution) {
setExpError("Title and Institution required");
return;
}

setResume(prev => ({
...prev,
experience: [...prev.experience, newExperience]
}));

setNewExperience({ title: "", institution: "", start: "", end: "", description: "", current: false });

setExpAdded(true);
setTimeout(() => setExpAdded(false), 1500);
};

const handleRemoveExperience = (index) => {
setResume(prev => ({
...prev,
experience: prev.experience.filter((_, i) => i !== index)
}));
};

const handleSave = async () => {

try {

const token = localStorage.getItem("token");

const response = await fetch(`http://localhost:5000/api/faculty/update/${resume._id}`, {
method: "PUT",
headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json"
},
body: JSON.stringify(resume)
});

const updated = await response.json();
setResume(updated);
setIsEditing(false);
alert("Resume updated successfully");

} catch (err) {
alert("Update failed");
}

};

return (

<div className="min-h-screen bg-gray-10">
 

<div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

<div className="max-w-6xl mx-auto px-6">

<div className="flex flex-col md:flex-row gap-6 -mt-20">

<div className="w-full md:w-1/3 bg-white rounded-xl shadow p-6 text-center">

<img
src={resume.profileImage || "/assets/default-profile.jpg"}
className="w-32 h-32 rounded-full mx-auto border-4 border-white object-cover"
/>

<h2 className="text-xl font-bold mt-4">{resume.name}</h2>
<p className="text-gray-600">{resume.title}</p>

{isEditing && (
<button className="flex items-center gap-2 mx-auto mt-3 text-sm text-blue-600">
<Camera size={16}/> Change Photo
</button>
)}

<div className="mt-6 text-left space-y-2 text-sm">

<div className="flex items-center gap-2">
<Mail size={16}/> {resume.email}
</div>

<div className="flex items-center gap-2">
<Phone size={16}/> {resume.phone}
</div>

<div className="flex items-center gap-2">
<MapPin size={16}/> {resume.location}
</div>

</div>

<div className="mt-6 text-left">

<h3 className="flex items-center gap-2 font-semibold mb-2">
<Award size={18}/> Skills
</h3>

{isEditing && (

<div className="flex gap-2 mb-3">

<input
value={newSkill}
onChange={handleSkillInputChange}
className="border p-2 flex-1 rounded"
placeholder="Add skill"
/>

<button
onClick={handleAddSkill}
className="bg-blue-600 text-white px-3 rounded flex items-center gap-1"
>
<Plus size={14}/> Add
</button>

</div>

)}

<div className="flex flex-wrap gap-2">

{resume.skills.map((skill,index)=>(
<span
key={index}
className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1"
>

{skill}

{isEditing && (
<button onClick={()=>handleRemoveSkill(index)}>
<Trash2 size={12}/>
</button>
)}

</span>
))}

</div>

</div>

</div>

<div className="flex-1 space-y-6">

<div className="bg-white p-6 rounded-xl shadow">

<div className="flex justify-between items-center mb-3">

<h3 className="flex items-center gap-2 text-lg font-bold">
<User size={18}/> About
</h3>

{isEditing ? (
<div className="flex gap-2">
<button
onClick={()=>setIsEditing(false)}
className="flex items-center gap-1 text-gray-500"
>
<X size={16}/> Cancel
</button>

<button
onClick={handleSave}
className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded"
>
<Save size={16}/> Save
</button>
</div>
) : (
<button
onClick={()=>setIsEditing(true)}
className="flex items-center gap-1 text-blue-600"
>
<Pencil size={16}/> Edit
</button>
)}

</div>

{isEditing ? (

<textarea
name="summary"
value={resume.summary}
onChange={handleChange}
className="w-full border p-3 rounded"
/>

) : (

<p className="text-gray-700">{resume.summary}</p>

)}

</div>

<div className="bg-white p-6 rounded-xl shadow">

<h3 className="flex items-center gap-2 text-lg font-bold mb-4">
<GraduationCap size={18}/> Education
</h3>

{isEditing && (

<div className="space-y-2 mb-4">

<input
name="degree"
placeholder="Degree"
className="border p-2 w-full rounded"
onChange={(e)=>{
const updated=[...resume.education]
updated[updated.length-1]={...updated[updated.length-1],degree:e.target.value}
setResume(prev=>({...prev,education:updated}))
}}
/>

<input
name="institution"
placeholder="Institution"
className="border p-2 w-full rounded"
/>

<input
name="year"
placeholder="Year"
className="border p-2 w-full rounded"
/>

<button
onClick={()=>{
setResume(prev=>({
...prev,
education:[...prev.education,{degree:"",institution:"",year:""}]
}))
}}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Add Education
</button>

</div>

)}

{resume.education.map((edu,index)=>(
<div key={index} className="border-l-4 border-indigo-500 pl-4 mb-4 flex justify-between">

<div>

<h4 className="font-semibold">{edu.degree}</h4>

<p className="text-gray-600">{edu.institution}</p>

<p className="text-sm text-gray-500">{edu.year}</p>

</div>

{isEditing && (

<button
onClick={()=>{
setResume(prev=>({
...prev,
education:prev.education.filter((_,i)=>i!==index)
}))
}}
className="text-red-500"
>
<Trash2 size={16}/>
</button>

)}

</div>
))}

</div>

<div className="bg-white p-6 rounded-xl shadow">

<h3 className="flex items-center gap-2 text-lg font-bold mb-4">
<Briefcase size={18}/> Experience
</h3>

{isEditing && (

<div className="space-y-2 mb-4">

<input
name="title"
value={newExperience.title}
onChange={handleExperienceInputChange}
placeholder="Job title"
className="border p-2 w-full rounded"
/>

<input
name="institution"
value={newExperience.institution}
onChange={handleExperienceInputChange}
placeholder="Institution"
className="border p-2 w-full rounded"
/>

<textarea
name="description"
value={newExperience.description}
onChange={handleExperienceInputChange}
placeholder="Description"
className="border p-2 w-full rounded"
/>

<button
onClick={handleAddExperience}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Add Experience
</button>

</div>

)}

{resume.experience.map((exp,index)=>(
<div key={index} className="border-l-4 border-indigo-500 pl-4 mb-4">

<div className="flex justify-between">

<div>

<h4 className="font-semibold">{exp.title}</h4>
<p className="text-gray-600">{exp.institution}</p>
<p className="text-sm text-gray-500">
{exp.start} - {exp.end || "Present"}
</p>

<p className="text-gray-700 mt-1">{exp.description}</p>

</div>

{isEditing && (

<button
onClick={()=>handleRemoveExperience(index)}
className="text-red-500 flex items-center gap-1"
>
<Trash2 size={14}/> Remove
</button>

)}

</div>

</div>
))}

</div>

<div className="bg-white p-6 rounded-xl shadow">

<h3 className="flex items-center gap-2 text-lg font-bold mb-4">
<BookOpen size={18}/> Publications
</h3>

{isEditing && (

<div className="space-y-2 mb-4">

<input
name="title"
value={newPublication.title}
onChange={handlePublicationInputChange}
placeholder="Title"
className="border p-2 w-full rounded"
/>

<input
name="description"
value={newPublication.description}
onChange={handlePublicationInputChange}
placeholder="Description"
className="border p-2 w-full rounded"
/>

<input
name="link"
value={newPublication.link}
onChange={handlePublicationInputChange}
placeholder="Link"
className="border p-2 w-full rounded"
/>

<button
onClick={handleAddPublication}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Add Publication
</button>

</div>

)}

{resume.publications.map((pub,index)=>(
<div key={index} className="border p-4 rounded mb-3 flex justify-between">

<div>

<h4 className="font-semibold">{pub.title}</h4>

<p className="text-gray-600">{pub.description}</p>

{pub.link && (
<a
href={pub.link}
target="_blank"
className="text-blue-600 flex items-center gap-1 text-sm"
>
<Link size={14}/> Visit
</a>
)}

</div>

{isEditing && (

<button
onClick={()=>handleRemovePublication(index)}
className="text-red-500"
>
<Trash2 size={16}/>
</button>

)}

</div>
))}

</div>

</div>

</div>

</div>


</div>


);

};

export default ResumeEditor;