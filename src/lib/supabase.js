// Dummy Supabase client for layout generation
export const supabase = {
    auth: {
        signInWithPassword: async ({ email, password }) => {
            // Mock response
            if (email && password) return { data: { user: { id: 'mock-user-id', email } }, error: null };
            return { data: null, error: { message: 'Invalid credentials' } };
        },
        signOut: async () => { },
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    },
    from: () => ({
        select: () => ({
            eq: () => ({
                single: async () => ({ data: { role: 'admin' }, error: null }) // Always return admin for now
            })
        })
    })
};
