import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RippleBackground from '../components/RippleBackground';
import EditableProfile from '../components/EditableProfile';

const HRProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const facultyIdFromState = location.state?.facultyId;
    const searchParams = new URLSearchParams(location.search);
    const facultyIdFromQuery = searchParams.get('facultyId');
    const jobIdFromState = location.state?.jobId;
    const jobIdFromQuery = searchParams.get('jobId');
    const facultyId = facultyIdFromState || facultyIdFromQuery;
    const jobId = jobIdFromState || jobIdFromQuery;
    const viewMode = searchParams.get('view') === 'current' ? 'current' : 'snapshot';
    const { user } = useContext(AuthContext);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [snapshotProfile, setSnapshotProfile] = useState(null);
    const [currentProfile, setCurrentProfile] = useState(null);
    const [snapshotMeta, setSnapshotMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            if (!facultyId) {
                if (isMounted) {
                    setError('No faculty selected. Please open a profile from the applicants list.');
                    setLoading(false);
                }
                return;
            }

            if (!user?.token) {
                if (isMounted) {
                    setError('Your session has expired. Please log in again.');
                    setLoading(false);
                }
                return;
            }

            if (!backendUrl) {
                if (isMounted) {
                    setError('Backend URL is not configured.');
                    setLoading(false);
                }
                return;
            }

            try {
                setLoading(true);
                setError('');

                const headers = {
                    Authorization: `Bearer ${user.token}`,
                };

                const currentProfileRequest = fetch(`${backendUrl}/api/profile/${facultyId}`, {
                    headers,
                });

                const snapshotRequest = jobId
                    ? fetch(`${backendUrl}/api/jobs/${jobId}/applicants/${facultyId}/snapshot`, {
                        headers,
                    })
                    : null;

                const [currentProfileResponse, snapshotResponse] = await Promise.all([
                    currentProfileRequest,
                    snapshotRequest,
                ]);

                if (!currentProfileResponse.ok) {
                    let message = 'Failed to load profile.';
                    try {
                        const errorData = await currentProfileResponse.json();
                        message = errorData.message || message;
                    } catch {
                        // Ignore JSON parsing errors for non-JSON error responses.
                    }
                    throw new Error(message);
                }

                const currentProfileData = await currentProfileResponse.json();
                let snapshotData = null;

                if (snapshotResponse) {
                    if (snapshotResponse.ok) {
                        snapshotData = await snapshotResponse.json();
                    } else if (snapshotResponse.status !== 404) {
                        let message = 'Failed to load application snapshot.';
                        try {
                            const errorData = await snapshotResponse.json();
                            message = errorData.message || message;
                        } catch {
                            // Ignore JSON parsing errors for non-JSON error responses.
                        }
                        throw new Error(message);
                    }
                }

                if (isMounted) {
                    setCurrentProfile(currentProfileData);
                    setSnapshotProfile(snapshotData?.profileSnapshot || null);
                    setSnapshotMeta(snapshotData || null);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                if (isMounted) {
                    setError(err.message || 'Failed to load profile.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [facultyId, jobId, user?.token, backendUrl]);

    if (loading) {
        return <p className="text-center">Loading profile...</p>;
    }

    if (error) {
        return (
            <RippleBackground>
                <div className="card p-6 max-w-3xl mx-auto m-2">
                    <button
                        onClick={() => jobId ? navigate(`/job-applicants/${jobId}`) : navigate(-1)}
                        className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                    >
                        Go Back
                    </button>
                    <p className="mt-4 text-red-600">{error}</p>
                </div>
            </RippleBackground>
        );
    }

    const isProfileUpdated = Boolean(
        snapshotMeta?.profileUpdatedAt &&
        currentProfile?.updatedAt &&
        new Date(currentProfile.updatedAt) > new Date(snapshotMeta.profileUpdatedAt)
    );

    const displayProfile = viewMode === 'current' || !snapshotProfile ? currentProfile : snapshotProfile;

    const handleViewCurrent = () => {
        const nextParams = new URLSearchParams(location.search);
        nextParams.set('view', 'current');
        if (facultyId) {
            nextParams.set('facultyId', facultyId);
        }
        if (jobId) {
            nextParams.set('jobId', jobId);
        }
        navigate(`${location.pathname}?${nextParams.toString()}`, {
            state: { facultyId, jobId },
        });
    };

    const handleViewSnapshot = () => {
        const nextParams = new URLSearchParams(location.search);
        nextParams.delete('view');
        if (facultyId) {
            nextParams.set('facultyId', facultyId);
        }
        if (jobId) {
            nextParams.set('jobId', jobId);
        }
        navigate(`${location.pathname}?${nextParams.toString()}`, {
            state: { facultyId, jobId },
        });
    };

    if (!displayProfile) {
        return <p className="text-center">Profile not found.</p>;
    }

    return (
        <RippleBackground>
            <div className="container py-8">
                {viewMode === 'current' && snapshotProfile && (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center justify-between">
                        <span>Viewing latest profile.</span>
                        <button
                            type="button"
                            onClick={handleViewSnapshot}
                            className="text-amber-900 underline hover:text-amber-700"
                        >
                            Back to Original Profile
                        </button>
                    </div>
                )}
                {viewMode === 'snapshot' && isProfileUpdated && (
                    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex items-center justify-between">
                        <span>Profile updated since application.</span>
                        <button
                            type="button"
                            onClick={handleViewCurrent}
                            className="text-slate-900 underline hover:text-slate-700"
                        >
                            View Latest Profile
                        </button>
                    </div>
                )}
                <EditableProfile
                    profile={displayProfile}
                    setProfile={() => { }}
                    isEditing={false}
                    setIsEditing={() => { }}
                    onSave={() => { }}
                    canEdit={false}
                    pageTitle={viewMode === 'current' ? 'Current Profile' : 'Applicant Profile'}
                    showBackButton
                    onBack={() => jobId ? navigate(`/job-applicants/${jobId}`) : navigate(-1)}
                />
            </div>
        </RippleBackground>
    );
};

export default HRProfile;
