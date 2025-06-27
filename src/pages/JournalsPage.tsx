import React, { useEffect } from 'react';
import { BookOpen, Download, ExternalLink, Calendar, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import PageContainer from "../components/common/PageContainer";
import SectionHeading from '../components/common/SectionHeading';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import NewsletterSidebar from '../components/common/NewsletterSidebar';

// Newsletter type
interface Newsletter {
  title: string;
  issueNumber: string;
  publishDate: string;
  downloadLink: string;
}

const JournalsPage = () => {
  useEffect(() => {
    document.title = 'Journals | DentalReach';
  }, []);

  const featuredJournals = [
    {
      title: 'Journal of Clinical Dentistry',
      publisher: 'International Dental Association',
      impact: '4.2',
      frequency: 'Monthly',
      cover: 'https://images.pexels.com/photos/3845727/pexels-photo-3845727.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      title: 'Dental Research Review',
      publisher: 'Global Dental Research Foundation',
      impact: '3.8',
      frequency: 'Bi-monthly',
      cover: 'https://images.pexels.com/photos/3845843/pexels-photo-3845843.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'Advances in Orthodontics',
      publisher: 'European Dental Society',
      impact: '3.5',
      frequency: 'Quarterly',
      cover: 'https://images.pexels.com/photos/3845757/pexels-photo-3845757.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const latestIssues = [
    {
      journal: 'Journal of Clinical Dentistry',
      issue: 'Volume 45, Issue 3',
      date: 'March 2025',
      topics: ['Implant Surgery', 'Digital Dentistry', 'Periodontics']
    },
    {
      journal: 'Dental Research Review',
      issue: 'Volume 32, Issue 2',
      date: 'February 2025',
      topics: ['Endodontics', 'Dental Materials', 'Clinical Studies']
    },
    {
      journal: 'Advances in Orthodontics',
      issue: 'Volume 28, Issue 1',
      date: 'January 2025',
      topics: ['Clear Aligners', 'Treatment Planning', 'Case Studies']
    }
  ];

  // Newsletter state
  const [selectedNewsletter, setSelectedNewsletter] = React.useState<Newsletter | null>(null);

  return (
    <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
      <PageHeader
        title="Dental Journals"
        subtitle="Access leading peer-reviewed journals in dentistry. Stay updated with the latest research, clinical studies, and academic publications."
      >
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <SecondaryButton>Browse All Journals</SecondaryButton>
          <PrimaryButton>Submit Manuscript</PrimaryButton>
        </div>
      </PageHeader>
      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
          {/* Newsletter Sidebar */}
          <NewsletterSidebar onSelect={setSelectedNewsletter} selected={selectedNewsletter} />
          {/* Main Content */}
          <div>
            {/* Show newsletter if selected, else show journals */}
            {selectedNewsletter ? (
              <Card className="mb-8">
                <h2 className="text-2xl font-bold mb-2">{selectedNewsletter.title}</h2>
                <div className="text-neutral-600 mb-2">Issue #{selectedNewsletter.issueNumber} &bull; {new Date(selectedNewsletter.publishDate).toLocaleDateString()}</div>
                <a href={selectedNewsletter.downloadLink} className="btn-outline text-sm px-4 py-1 rounded transition-all duration-200 ease-in-out" target="_blank" rel="noopener noreferrer">Download</a>
              </Card>
            ) : null}
            {/* Featured Journals */}
            <section className="py-12">
              <SectionHeading title="Featured Journals" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredJournals.map((journal, idx) => (
                  <Card key={idx} className="flex flex-col hover:shadow-lg transition-all duration-200 ease-in-out">
                    <img src={journal.cover} alt={journal.title} className="w-full h-40 object-cover rounded mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">{journal.title}</h2>
                    <div className="text-base font-normal text-neutral-600 mb-2">{journal.publisher}</div>
                    <div className="flex items-center text-sm text-neutral-500 mb-2">
                      <span className="mr-2">Impact: {journal.impact}</span>
                      <span>Frequency: {journal.frequency}</span>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <a href="#" className="border border-dental-600 text-dental-600 bg-white hover:bg-dental-50 rounded-lg py-2 px-4 font-semibold text-sm transition-all duration-200 ease-in-out">Download</a>
                      <a href="#" className="border border-dental-600 text-dental-600 bg-white hover:bg-dental-50 rounded-lg py-2 px-4 font-semibold text-sm transition-all duration-200 ease-in-out">Details</a>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
            {/* Latest Issues */}
            <section className="py-12 bg-neutral-50">
              <SectionHeading title="Latest Issues" />
              <div className="space-y-8">
                {latestIssues.map((issue, idx) => (
                  <Card key={idx} className="border border-neutral-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{issue.journal}</h3>
                        <p className="text-neutral-600">{issue.issue}</p>
                        <div className="flex items-center text-sm text-neutral-500 mt-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          {issue.date}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {issue.topics.map((topic, topicIdx) => (
                          <span 
                            key={topicIdx}
                            className="px-3 py-1 bg-dental-50 text-dental-600 rounded-full text-sm"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                      <SecondaryButton className="flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </SecondaryButton>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
            {/* Submit & Subscribe */}
            <section className="py-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Submit Manuscript */}
                <Card className="border border-neutral-100 p-8">
                  <div className="flex items-start mb-6">
                    <div className="bg-dental-50 p-3 rounded-xl">
                      <FileText className="h-6 w-6 text-dental-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold mb-2">Submit Your Manuscript</h3>
                      <p className="text-neutral-600">
                        Share your research with the dental community. Our peer-review process ensures high-quality publications.
                      </p>
                    </div>
                  </div>
                  <PrimaryButton className="w-full">Start Submission</PrimaryButton>
                </Card>
                {/* Subscribe */}
                <Card className="border border-neutral-100 p-8">
                  <div className="flex items-start mb-6">
                    <div className="bg-dental-50 p-3 rounded-xl">
                      <BookOpen className="h-6 w-6 text-dental-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold mb-2">Subscribe to Journals</h3>
                      <p className="text-neutral-600">
                        Get unlimited access to all our journals. Special rates available for institutions.
                      </p>
                    </div>
                  </div>
                  <PrimaryButton className="w-full">View Subscription Plans</PrimaryButton>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default JournalsPage;