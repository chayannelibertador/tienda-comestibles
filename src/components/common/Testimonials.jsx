import { useState, useEffect, useRef } from 'react';
import { useTestimonials } from '../../context/TestimonialsContext';
import './Testimonials.css';

const ITEMS_PER_PAGE = 3;

export default function Testimonials() {
    const { testimonials, loading } = useTestimonials();

    // Si no hay testimonios, usar placeholder o no renderizar
    const displayTestimonials = testimonials.length > 0 ? testimonials : [];

    const titleRef = useRef(null);
    const [isTitleVisible, setIsTitleVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsTitleVisible(entry.isIntersecting);
        }, { threshold: 0.1 });

        if (titleRef.current) observer.observe(titleRef.current);
        return () => { if (titleRef.current) observer.unobserve(titleRef.current); };
    }, []);

    const [currentPage, setCurrentPage] = useState(0);
    const [animationState, setAnimationState] = useState(''); // '', 'slide-out-left', 'slide-out-right', 'slide-in-right', 'slide-in-left'
    const [isAnimating, setIsAnimating] = useState(false);
    const intervalRef = useRef(null);

    const startInterval = () => {
        if (displayTestimonials.length <= ITEMS_PER_PAGE) return;

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            handleNext();
        }, 8000); // 8 seconds interval
    };

    useEffect(() => {
        startInterval();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [displayTestimonials.length]);

    const changePage = (direction) => {
        if (isAnimating || displayTestimonials.length <= ITEMS_PER_PAGE) return;

        setIsAnimating(true);
        startInterval(); // Reset timer
        setAnimationState(direction === 'next' ? 'slide-out-left' : 'slide-out-right');

        setTimeout(() => {
            setCurrentPage((prev) => {
                const totalPages = Math.ceil(displayTestimonials.length / ITEMS_PER_PAGE);
                if (direction === 'next') {
                    return (prev + 1) % totalPages;
                } else {
                    return (prev - 1 + totalPages) % totalPages;
                }
            });

            setAnimationState(direction === 'next' ? 'slide-in-right' : 'slide-in-left');
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setAnimationState('slide-center');
                    setIsAnimating(false);
                });
            });
        }, 500);
    };

    const handleNext = () => changePage('next');
    const handlePrev = () => changePage('prev');

    const startIndex = currentPage * ITEMS_PER_PAGE;

    const visibleReviews = [];
    if (displayTestimonials.length > 0) {
        for (let i = 0; i < ITEMS_PER_PAGE; i++) {
            const index = (startIndex + i) % displayTestimonials.length;
            visibleReviews.push(displayTestimonials[index]);
        }
    }

    if (displayTestimonials.length === 0 && !loading) {
        return null;
    }

    return (
        <section className="testimonials">
            <div className={`flap-bg-container flap-right ${isTitleVisible ? 'is-visible' : ''}`}>
               <div className="flap-shape bg-brand"></div>
            </div>

            <div className="testimonials__content">
                <div className="section-title-wrapper" ref={titleRef}>
                    <h2 className={`animated-title-text align-right ${isTitleVisible ? 'is-visible' : ''}`}>
                        ¿Qué opinan nuestros clientes?
                    </h2>
                </div>
                <div className="testimonials__wrapper">
                    {displayTestimonials.length > ITEMS_PER_PAGE && (
                        <button className="nav-btn prev" onClick={handlePrev} aria-label="Anterior">‹</button>
                    )}

                    <div className="testimonials__container">
                        <div className={`testimonials__grid ${animationState}`}>
                            {visibleReviews.map((review) => (
                                <div key={review._id || review.id} className="testimonial-card">
                                    {review.avatar ? (
                                        <img src={review.avatar} alt={review.name} className="testimonial-avatar-img" />
                                    ) : (
                                        <div className="testimonial-avatar">{review.name ? review.name[0] : '?'}</div>
                                    )}
                                    <p className="testimonial-comment">"{review.comment}"</p>
                                    <span className="testimonial-name">- {review.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {displayTestimonials.length > ITEMS_PER_PAGE && (
                        <button className="nav-btn next" onClick={handleNext} aria-label="Siguiente">›</button>
                    )}
                </div>
            </div>
        </section>
    );
}
