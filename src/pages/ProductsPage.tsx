import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

const ProductsPage = () => {
  const products = [
    {
      id: 1,
      name: 'Invisalign Clear Retainers',
      category: 'Orthodontics',
      description: 'Advanced clear aligners for precise teeth straightening. Custom-made, removable, and virtually invisible.',
      price: '$3,500',
      rating: 4.8,
      reviews: 245,
      image: 'https://images.pexels.com/photos/13207280/pexels-photo-13207280.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: [
        'Custom-made clear aligners',
        'Virtually invisible design',
        'Removable for eating and cleaning',
        'Comfortable fit',
        'Progressive teeth straightening'
      ],
      slug: 'invisalign-clear-retainers'
    },
    {
      id: 2,
      name: '3D Intraoral Scanner',
      category: 'Equipment',
      description: 'High-precision digital scanner for accurate 3D dental impressions. Fast, comfortable, and powder-free scanning.',
      price: '$15,999',
      rating: 4.9,
      reviews: 128,
      image: '/src/3d-mouth-scanner.jpg',
      features: [
        'High-precision scanning',
        'Real-time 3D visualization',
        'Powder-free technology',
        'Fast scanning speed',
        'Patient comfort focused'
      ],
      slug: '3d-intraoral-scanner'
    },
    {
      id: 3,
      name: 'Organic Mouth Wash',
      category: 'Dental Care',
      description: 'All-natural, alcohol-free mouthwash made with organic ingredients. Promotes oral health while being gentle on teeth and gums.',
      price: '$24.99',
      rating: 4.7,
      reviews: 312,
      image: '/src/organic-mouth-wash.jpg',
      features: [
        '100% organic ingredients',
        'Alcohol-free formula',
        'Fresh natural mint flavor',
        'Promotes healthy gums',
        'pH balanced'
      ],
      slug: 'organic-mouth-wash'
    }
  ];

  useEffect(() => {
    document.title = 'Products | DentalReach';
  }, []);

  return (
    <div className="pt-20 pb-16 font-inter">
      <PageHeader
        title="Products"
        subtitle="Explore the latest dental products, equipment, and materials in the market."
      />
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow duration-200">
              <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
              <div className="text-base font-normal text-neutral-600 mb-2">{product.category}</div>
              <div className="text-base font-normal text-neutral-600 mb-4">{product.description}</div>
              <div className="flex items-center text-sm text-neutral-500 mb-2">
                <span className="mr-2">{product.price}</span>
                <span>({product.reviews} reviews)</span>
              </div>
              <a href="#" className="btn-outline text-sm mt-auto">View Details</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;