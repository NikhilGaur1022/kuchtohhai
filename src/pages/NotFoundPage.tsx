import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 pt-16">
      <div className="container-custom text-center py-16">
        <div className="mb-8">
          <span className="text-8xl font-bold text-dental-600">404</span>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-neutral-900">Page Not Found</h1>
        <p className="text-xl text-neutral-600 max-w-lg mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center">
          <ArrowLeft className="mr-2 h-5 w-5" /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;