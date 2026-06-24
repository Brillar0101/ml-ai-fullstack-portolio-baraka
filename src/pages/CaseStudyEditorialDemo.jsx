import React, { useEffect } from 'react';
import CaseStudyEditorial from '../components/case-study/CaseStudyEditorial';
import { clapperboardCaseStudy } from '../data/caseStudies';

export default function CaseStudyEditorialDemo() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <CaseStudyEditorial data={clapperboardCaseStudy} />;
}
