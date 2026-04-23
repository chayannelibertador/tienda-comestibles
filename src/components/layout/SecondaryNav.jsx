import { useNavigate, useSearchParams } from 'react-router-dom';
import './SecondaryNav.css';

const CATEGORIES = ['Todos', 'Frutas', 'Verduras', 'Panadería', 'Lácteos', 'Bebidas'];

export default function SecondaryNav() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentCategory = searchParams.get('category') || 'Todos';

    const handleCategoryClick = (category) => {
        if (category === 'Todos') {
            navigate('/catalog');
        } else {
            navigate(`/catalog?category=${category}`);
        }
    };

    return (
        <nav className="secondary-nav">
            <div className="secondary-nav__container">
                {CATEGORIES.map(category => (
                    <button
                        key={category}
                        className={`secondary-nav__link ${currentCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </nav>
    );
}
