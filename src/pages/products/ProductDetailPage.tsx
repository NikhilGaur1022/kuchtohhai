import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ChevronLeft, Check, ShoppingCart } from 'lucide-react';

// This would typically come from an API or database
const products = [
  {
    id: 1,
    name: 'Invisalign Clear Retainers',
    category: 'Orthodontics',
    description: 'Advanced clear aligners for precise teeth straightening. Custom-made, removable, and virtually invisible.',
    longDescription: `Invisalign clear retainers represent the cutting edge of orthodontic technology. These custom-made aligners are designed to gradually shift your teeth into their optimal position while being virtually invisible when worn.

Each set of aligners is precisely crafted using advanced 3D imaging technology to ensure a perfect fit and maximum effectiveness. The treatment process involves wearing a series of aligners, each making slight adjustments to tooth position.

Unlike traditional braces, Invisalign retainers can be removed for eating, drinking, and maintaining oral hygiene. This flexibility, combined with their clear appearance, makes them an ideal choice for both adults and teens seeking orthodontic treatment.`,
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
    specifications: [
      { label: 'Material', value: 'Medical-grade thermoplastic' },
      { label: 'Treatment Duration', value: '12-18 months average' },
      { label: 'Replacement Frequency', value: 'Every 1-2 weeks' },
      { label: 'Cleaning Method', value: 'Specialized cleaning solution' },
      { label: 'Warranty', value: 'Included with treatment plan' }
    ],
    slug: 'invisalign-clear-retainers'
  },
  {
    id: 2,
    name: '3D Intraoral Scanner',
    category: 'Equipment',
    description: 'High-precision digital scanner for accurate 3D dental impressions. Fast, comfortable, and powder-free scanning.',
    longDescription: `The 3D Intraoral Scanner represents a revolutionary advancement in dental imaging technology. This state-of-the-art device captures highly detailed, full-color 3D images of a patient's oral cavity with unprecedented accuracy and speed.

Using advanced optical technology and AI-powered processing, the scanner creates precise digital impressions without the need for traditional molding materials. This not only improves patient comfort but also significantly reduces procedure time and enhances accuracy.

The scanner's ergonomic design and intuitive interface make it easy to operate, while its powerful software enables real-time visualization and immediate analysis of scan data. This makes it an invaluable tool for treatment planning, patient communication, and digital workflow integration.`,
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
    specifications: [
      { label: 'Scanning Technology', value: 'Advanced optical scanning' },
      { label: 'Accuracy', value: '≤10 microns' },
      { label: 'Scan Time', value: 'Full arch under 3 minutes' },
      { label: 'Output Format', value: 'STL, PLY, OBJ' },
      { label: 'Warranty', value: '2 years manufacturer warranty' }
    ],
    slug: '3d-intraoral-scanner'
  },
  {
    id: 3,
    name: 'Organic Mouth Wash',
    category: 'Dental Care',
    description: 'All-natural, alcohol-free mouthwash made with organic ingredients. Promotes oral health while being gentle on teeth and gums.',
    longDescription: `Our Organic Mouth Wash is a premium oral care solution that combines the power of nature with scientific innovation. Formulated with carefully selected organic ingredients, this alcohol-free mouthwash effectively promotes oral health while being gentle on teeth and gums.

The unique blend includes organic tea tree oil for its natural antimicrobial properties, organic aloe vera for soothing and healing, and organic mint for fresh breath. Unlike conventional mouthwashes, our formula is free from harsh chemicals, artificial colors, and synthetic flavors.

The pH-balanced formula helps maintain optimal oral conditions while supporting the mouth's natural microbiome. Regular use helps prevent plaque formation, promotes gum health, and ensures long-lasting fresh breath without the burning sensation associated with alcohol-based mouthwashes.`,
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
    specifications: [
      { label: 'Size', value: '500ml' },
      { label: 'Ingredients', value: 'All organic, naturally derived' },
      { label: 'Usage', value: 'Twice daily' },
      { label: 'Shelf Life', value: '24 months' },
      { label: 'Certification', value: 'Organic certified' }
    ],
    slug: 'organic-mouth-wash'
  }
];

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find(p => p.slug === slug);

  if (!product) {
    return (
      <div className="pt-20 pb-16">
        <div className="container-custom text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/products" className="text-dental-600 hover:text-dental-700">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16">
      {/* Breadcrumb */}
      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="container-custom py-4">
          <Link 
            to="/products" 
            className="text-dental-600 hover:text-dental-700 flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div>
            <span className="text-sm font-medium text-dental-600 bg-dental-50 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold mt-4 mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 font-medium">{product.rating}</span>
              </div>
              <span className="mx-2">•</span>
              <span className="text-neutral-600">{product.reviews} reviews</span>
            </div>

            <p className="text-xl font-bold text-dental-700 mb-6">
              {product.price}
            </p>

            <div className="prose max-w-none mb-8">
              <p className="text-neutral-600">
                {product.longDescription}
              </p>
            </div>

            <button className="bg-dental-600 text-white hover:bg-dental-700 rounded-lg py-2 px-4 font-semibold w-full sm:w-auto flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Contact for Purchase
            </button>

            {/* Features */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Key Features</h2>
              <ul className="space-y-3">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Specifications</h2>
              <div className="bg-neutral-50 rounded-xl p-6">
                <dl className="space-y-4">
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} className="flex justify-between">
                      <dt className="text-neutral-600">{spec.label}</dt>
                      <dd className="font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;