import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { getAdminToken } from './UserContext';

const TestimonialsContext = createContext();

export function useTestimonials() {
    return useContext(TestimonialsContext);
}

// API URL - In production, use env variable
const API_URL = '/api/testimonials';

export function TestimonialsProvider({ children }) {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToast } = useToast();

    // Fetch testimonials
    const fetchTestimonials = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Error al obtener testimonios');
            const data = await response.json();
            setTestimonials(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching testimonials:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    // Create testimonial
    const addTestimonial = async (testimonialData) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`
                },
                body: JSON.stringify(testimonialData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear testimonio');
            }

            const newTestimonial = await response.json();
            setTestimonials(prev => [newTestimonial, ...prev]);
            addToast('Testimonio agregado correctamente', 'success');
            return newTestimonial;
        } catch (err) {
            console.error('Error adding testimonial:', err);
            addToast(err.message, 'error');
            throw err;
        }
    };

    // Update testimonial
    const updateTestimonial = async (id, testimonialData) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`
                },
                body: JSON.stringify(testimonialData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar testimonio');
            }

            const updatedTestimonial = await response.json();
            setTestimonials(prev => prev.map(t =>
                t.id === id || t._id === id ? updatedTestimonial : t
            ));
            addToast('Testimonio actualizado correctamente', 'success');
            return updatedTestimonial;
        } catch (err) {
            console.error('Error updating testimonial:', err);
            addToast(err.message, 'error');
            throw err;
        }
    };

    // Delete testimonial
    const deleteTestimonial = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar testimonio');
            }

            setTestimonials(prev => prev.filter(t => t.id !== id && t._id !== id));
            addToast('Testimonio eliminado correctamente', 'info');
        } catch (err) {
            console.error('Error deleting testimonial:', err);
            addToast(err.message, 'error');
            throw err;
        }
    };

    const value = {
        testimonials,
        loading,
        error,
        fetchTestimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial
    };

    return (
        <TestimonialsContext.Provider value={value}>
            {children}
        </TestimonialsContext.Provider>
    );
}
