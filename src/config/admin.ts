export const ADMIN_EMAILS = [
    'kingraj1344@gmail.com',
    'dean@university.edu',
    'faculty@university.edu'
];

export const isAdmin = (email: string | undefined): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
}; 