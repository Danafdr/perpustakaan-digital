import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

declare var route: any;

interface Setting {
    id: number;
    key: string;
    value: string;
    type: 'string' | 'integer' | 'boolean';
    group: string;
}

interface Props {
    auth: any;
    settings: Record<string, Setting[]>; // Grouped by group name
}

export default function Settings({ auth, settings }: Props) {
    // Flatten settings for form data, but keep structure for display
    const initialValues: Record<string, any> = {};

    // We need to map the flat key-value pairs for the form
    Object.values(settings).flat().forEach(s => {
        initialValues[s.key] = s.type === 'boolean' ? Boolean(Number(s.value)) : s.value;
    });

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        settings: Object.values(settings).flat().map(s => ({
            key: s.key,
            value: s.value // Initial value stringified
        }))
    });

    const handleChange = (key: string, value: any) => {
        // Find index of setting in the array
        const index = data.settings.findIndex(s => s.key === key);
        if (index !== -1) {
            const newSettings = [...data.settings];
            newSettings[index].value = value.toString(); // Store as string for DB
            setData('settings', newSettings);
        }
    };

    const getSettingValue = (key: string) => {
        const setting = data.settings.find(s => s.key === key);
        return setting ? setting.value : '';
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    const [searchQuery, setSearchQuery] = useState<string>('');
    // Helper to format key names (e.g., password_min_length -> Password Min Length)
    const formatLabel = (key: string) => {
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Admin Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Settings</h1>
                            <p className="text-gray-500 dark:text-gray-400">Configure global application settings.</p>
                        </div>

                        <div className="ml-6 w-full max-w-sm">
                            <label className="sr-only">Search settings</label>
                            <div className="relative">
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search settings..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        {/* Security Group */}
                        {settings['security'] && (
                            <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                    Security Settings
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {settings['security'].map((setting) => (
                                        <div key={setting.id}>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {formatLabel(setting.key)}
                                            </label>
                                            {setting.type === 'boolean' ? (
                                                <div className="flex items-center">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={getSettingValue(setting.key) === '1'}
                                                            onChange={(e) => handleChange(setting.key, e.target.checked ? '1' : '0')}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                            {getSettingValue(setting.key) === '1' ? 'Enabled' : 'Disabled'}
                                                        </span>
                                                    </label>
                                                </div>
                                            ) : (
                                                <input
                                                    type="number"
                                                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white py-2.5"
                                                    value={getSettingValue(setting.key)}
                                                    onChange={(e) => handleChange(setting.key, e.target.value)}
                                                />
                                            )}
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Control the {setting.key.replace(/_/g, ' ')} requirement.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* System Group */}
                        {settings['system'] && (
                            <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                                    </svg>
                                    System Settings (IDs)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {settings['system'].map((setting) => (
                                        <div key={setting.id}>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {formatLabel(setting.key)}
                                            </label>
                                            {setting.type === 'boolean' ? (
                                                <div className="flex items-center">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={getSettingValue(setting.key) === '1'}
                                                            onChange={(e) => handleChange(setting.key, e.target.checked ? '1' : '0')}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                            {getSettingValue(setting.key) === '1' ? 'Enabled' : 'Disabled'}
                                                        </span>
                                                    </label>
                                                </div>
                                            ) : (
                                                <input
                                                    type="number"
                                                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm dark:bg-gray-700 dark:text-white py-2.5"
                                                    value={getSettingValue(setting.key)}
                                                    onChange={(e) => handleChange(setting.key, e.target.value)}
                                                />
                                            )}
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Configure {setting.key.replace(/_/g, ' ')}.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-4 pt-4">
                            {recentlySuccessful && (
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium animate-pulse">
                                    Settings saved successfully!
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center rounded-xl border border-transparent bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
