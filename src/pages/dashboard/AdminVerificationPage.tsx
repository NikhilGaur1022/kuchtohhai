import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Eye, Loader, User, Building, Mail, Phone } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import PageContainer from '../../components/common/PageContainer';
import { supabase } from '../../lib/supabase';

interface VerificationApplication {
  id: number;
  user_id: string;
  business_name: string;
  business_type: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_license: string;
  identity_document: string;
  experience_description: string;
  website_url: string;
  social_media_links: any;
  additional_info: string;
  status: string;
  admin_notes: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminVerificationPage = () => {
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<VerificationApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'view'>('view');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  // Check if user is admin and get current user info
  useEffect(() => {
    const checkAdminAndGetUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        setCurrentUser(user);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to verify admin status');
          return;
        }

        if (!profile || profile.role !== 'admin') {
          navigate('/dashboard');
          return;
        }

        console.log('Admin verified:', profile);
      } catch (err) {
        console.error('Error in admin check:', err);
        setError('Failed to verify admin status');
      }
    };

    checkAdminAndGetUser();
  }, [navigate]);

  // Fetch verification applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching verification applications...');

        // First, let's check if the current user is admin
        const { data: adminCheck, error: adminError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        if (adminError) {
          console.error('Admin check error:', adminError);
          throw new Error('Failed to verify admin status');
        }

        if (adminCheck?.role !== 'admin') {
          throw new Error('Access denied: Admin role required');
        }

        console.log('Admin status confirmed, fetching applications...');

        // Fetch verification applications with profile data
        const { data, error: fetchError } = await supabase
          .from('verification_applications')
          .select(`
            *,
            profiles!verification_applications_user_id_fkey (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          throw fetchError;
        }

        console.log('Applications fetched:', data);
        setApplications(data || []);

        if (!data || data.length === 0) {
          console.log('No applications found');
        }

      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch verification applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [currentUser]);

  const handleViewApplication = (application: VerificationApplication) => {
    setSelectedApplication(application);
    setModalType('view');
    setShowModal(true);
    setAdminNotes(application.admin_notes || '');
  };

  const handleApproveClick = (application: VerificationApplication) => {
    setSelectedApplication(application);
    setModalType('approve');
    setShowModal(true);
    setAdminNotes('');
  };

  const handleRejectClick = (application: VerificationApplication) => {
    setSelectedApplication(application);
    setModalType('reject');
    setShowModal(true);
    setAdminNotes('');
  };

  const handleApprove = async () => {
    if (!selectedApplication || !currentUser) return;

    setIsSubmitting(true);
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('verification_applications')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);

      if (updateError) throw updateError;

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_verified: true,
          verification_status: 'verified'
        })
        .eq('id', selectedApplication.user_id);

      if (profileError) throw profileError;

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedApplication.user_id,
          type: 'application_approved',
          message: 'Your verification application has been approved! You can now create events.',
          reason: adminNotes || null
        });

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApplication.id
            ? { ...app, status: 'approved', admin_notes: adminNotes }
            : app
        )
      );

      setShowModal(false);
      alert('Application approved successfully!');
    } catch (err) {
      console.error('Error approving application:', err);
      setError('Failed to approve application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !adminNotes.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('verification_applications')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);

      if (updateError) throw updateError;

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          verification_status: 'rejected'
        })
        .eq('id', selectedApplication.user_id);

      if (profileError) throw profileError;

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedApplication.user_id,
          type: 'application_rejected',
          message: 'Your verification application was not approved.',
          reason: adminNotes
        });

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApplication.id
            ? { ...app, status: 'rejected', admin_notes: adminNotes }
            : app
        )
      );

      setShowModal(false);
      alert('Application rejected and user notified.');
    } catch (err) {
      console.error('Error rejecting application:', err);
      setError('Failed to reject application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-dental-600 mx-auto mb-4" />
              <div className="text-neutral-600">Loading verification applications...</div>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
      <PageHeader
        title="Verification Applications"
        subtitle="Review and approve user verification requests"
      />
      <PageContainer>
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            <div className="font-medium">Error:</div>
            <div>{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try refreshing the page
            </button>
          </div>
        )}

        {/* Debug Info */}
        {currentUser && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6 text-sm">
            <div><strong>Debug Info:</strong></div>
            <div>Current User ID: {currentUser.id}</div>
            <div>Applications Found: {applications.length}</div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Applications</p>
                <p className="text-2xl font-bold text-neutral-900">{applications.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Loader className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(a => a.status === 'approved').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Applicant</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Business</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500">Applied</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                      {error ? 'Unable to fetch verification requests. Please check your admin permissions.' : 'No verification applications found.'}
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {application.profiles?.full_name || 'Unknown User'}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {application.profiles?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900">{application.business_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700">
                          {application.business_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          application.status === 'approved' 
                            ? 'bg-green-100 text-green-700'
                            : application.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {new Date(application.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewApplication(application)}
                            className="p-2 text-neutral-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveClick(application)}
                                className="p-2 text-neutral-400 hover:text-green-600 transition-colors"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectClick(application)}
                                className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                {modalType === 'view' ? 'Application Details' :
                 modalType === 'approve' ? 'Approve Application' : 'Reject Application'}
              </h3>
              
              {/* Application Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Applicant</label>
                    <p className="text-sm text-neutral-900">{selectedApplication.profiles?.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Email</label>
                    <p className="text-sm text-neutral-900">{selectedApplication.profiles?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Business Name</label>
                    <p className="text-sm text-neutral-900">{selectedApplication.business_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Business Type</label>
                    <p className="text-sm text-neutral-900">{selectedApplication.business_type.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Business Address</label>
                  <p className="text-sm text-neutral-900">{selectedApplication.business_address}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Phone</label>
                    <p className="text-sm text-neutral-900">{selectedApplication.business_phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Business Email</label>
                    <p className="text-sm text-neutral-900">{selectedApplication.business_email}</p>
                  </div>
                </div>
                
                {selectedApplication.experience_description && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Experience</label>
                    <p className="text-sm text-neutral-900">{selectedApplication.experience_description}</p>
                  </div>
                )}
                
                {selectedApplication.website_url && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Website</label>
                    <a href={selectedApplication.website_url} target="_blank" rel="noopener noreferrer" 
                       className="text-sm text-dental-600 hover:text-dental-700">
                      {selectedApplication.website_url}
                    </a>
                  </div>
                )}
              </div>

              {/* Admin Notes Input for Approve/Reject */}
              {(modalType === 'approve' || modalType === 'reject') && (
                <div className="mb-6">
                  <label htmlFor="admin_notes" className="block text-sm font-medium text-neutral-700 mb-2">
                    {modalType === 'reject' ? 'Reason for Rejection *' : 'Admin Notes (Optional)'}
                  </label>
                  <textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-500"
                    placeholder={modalType === 'reject' ? 'Please provide a reason for rejection...' : 'Optional notes for the applicant...'}
                    required={modalType === 'reject'}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900"
                  disabled={isSubmitting}
                >
                  {modalType === 'view' ? 'Close' : 'Cancel'}
                </button>
                
                {modalType === 'approve' && (
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Approve Application
                      </>
                    )}
                  </button>
                )}
                
                {modalType === 'reject' && (
                  <button
                    onClick={handleReject}
                    disabled={!adminNotes.trim() || isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Reject Application
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default AdminVerificationPage;