import React, { useEffect } from 'react';

// Mock data for dentists
const dentists = [
  { name: 'Dr. Sarah Johnson', articlesPublished: 18, likesReceived: 240 },
  { name: 'Dr. Michael Chen', articlesPublished: 15, likesReceived: 210 },
  { name: 'Dr. Emily Rodriguez', articlesPublished: 22, likesReceived: 180 },
  { name: 'Dr. James Wilson', articlesPublished: 10, likesReceived: 300 },
  { name: 'Dr. Aisha Patel', articlesPublished: 14, likesReceived: 170 },
  { name: 'Dr. Robert Kim', articlesPublished: 20, likesReceived: 150 },
];

// Calculate overallScore and sort
const dentistsWithScore = dentists.map(d => ({
  ...d,
  overallScore: d.articlesPublished * 10 + d.likesReceived,
})).sort((a, b) => b.overallScore - a.overallScore);

const AwardsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Awards | DentalReach';
  }, []);

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50 font-inter">
      <section className="container-custom mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-dental-700">Dentist Leaderboard</h1>
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Articles Published</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Likes Received</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Overall Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-base font-normal">
              {dentistsWithScore.map((dentist, idx) => (
                <tr key={dentist.name} className={idx === 0 ? 'bg-dental-50 font-bold' : ''}>
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">{dentist.name}</td>
                  <td className="px-4 py-3">{dentist.articlesPublished}</td>
                  <td className="px-4 py-3">{dentist.likesReceived}</td>
                  <td className="px-4 py-3">{dentist.overallScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AwardsPage;
