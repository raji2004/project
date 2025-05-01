import React, { useState, useEffect } from 'react';
import { useResourcesStore } from '../../stores/resourcesStore';
import { useAuthStore } from '../../stores/authStore';
import { Upload, Trash2 } from 'lucide-react';

interface ValidationErrors {
    department?: string;
    title?: string;
    file?: string;
    type?: string;
}

export default function UploadResources() {
    const { user } = useAuthStore();
    const {
        departments,
        resources,
        loading,
        error,
        fetchDepartments,
        fetchResourcesByDepartment,
        uploadResource,
        deleteResource,
    } = useResourcesStore();

    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState<'pdf' | 'video' | 'link'>('pdf');
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    useEffect(() => {
        if (selectedDepartment) {
            fetchResourcesByDepartment(selectedDepartment);
        }
    }, [selectedDepartment, fetchResourcesByDepartment]);

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!selectedDepartment) {
            errors.department = 'Please select a department';
        }

        if (!title.trim()) {
            errors.title = 'Title is required';
        }

        if (!file && type !== 'link') {
            errors.file = 'Please select a file';
        }

        if (!type) {
            errors.type = 'Please select a resource type';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors({});

        if (!validateForm() || !file) return;

        try {
            await uploadResource({
                department_id: selectedDepartment,
                title,
                description: description || null,
                file,
                type,
            });

            // Reset form
            setTitle('');
            setDescription('');
            setFile(null);
            setType('pdf');
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    const handleDelete = async (resourceId: string) => {
        if (!selectedDepartment) return;
        if (window.confirm('Are you sure you want to delete this resource?')) {
            try {
                await deleteResource(resourceId, selectedDepartment);
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }
    };

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    Please sign in to access this page.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Lecture Resources</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                        Department
                    </label>
                    <select
                        id="department"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className={`mt-1 block w-full rounded-md border ${validationErrors.department ? 'border-red-500' : 'border-gray-300'
                            } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
                    >
                        <option value="">Select a department</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                    {validationErrors.department && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.department}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`mt-1 block w-full rounded-md border ${validationErrors.title ? 'border-red-500' : 'border-gray-300'
                            } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
                    />
                    {validationErrors.title && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description (optional)
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Resource Type
                    </label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value as 'pdf' | 'video' | 'link')}
                        className={`mt-1 block w-full rounded-md border ${validationErrors.type ? 'border-red-500' : 'border-gray-300'
                            } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
                    >
                        <option value="pdf">PDF Document</option>
                        <option value="video">Video</option>
                        <option value="link">External Link</option>
                    </select>
                    {validationErrors.type && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.type}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                        File
                    </label>
                    <div className="mt-1 flex items-center">
                        <input
                            id="file"
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>
                    {validationErrors.file && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.file}</p>
                    )}
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? (
                            'Uploading...'
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Resource
                            </>
                        )}
                    </button>
                </div>
            </form>

            {selectedDepartment && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Resources</h2>
                    {loading ? (
                        <p className="text-gray-500">Loading resources...</p>
                    ) : resources.length > 0 ? (
                        <div className="space-y-4">
                            {resources.map((resource) => (
                                <div
                                    key={resource.id}
                                    className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{resource.title}</h3>
                                        {resource.description && (
                                            <p className="text-gray-600 mt-1">{resource.description}</p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-2">
                                            Type: {resource.type} • Uploaded: {new Date(resource.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(resource.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No resources uploaded yet.</p>
                    )}
                </div>
            )}
        </div>
    );
} 