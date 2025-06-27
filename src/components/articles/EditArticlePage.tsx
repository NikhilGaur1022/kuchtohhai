import React from 'react';
import SubmissionPage from '../../pages/SubmissionPage';

const EditArticlePage = ({ articleId }) => {
  return (
    <SubmissionPage 
      isEdit={true} 
      articleId={articleId} 
    />
  );
};

export default EditArticlePage;
