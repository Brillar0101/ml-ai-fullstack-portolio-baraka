import React, { useEffect } from 'react';
import CaseStudySpotlight from '../components/case-study/CaseStudySpotlight';
import { clapperboardCaseStudy } from '../data/caseStudies';

export default function CaseStudySpotlightDemo() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <CaseStudySpotlight data={clapperboardCaseStudy} />;
}
