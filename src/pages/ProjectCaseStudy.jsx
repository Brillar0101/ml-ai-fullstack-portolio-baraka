import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CaseStudyEditorial from '../components/case-study/CaseStudyEditorial';
import { caseStudies } from '../data/caseStudies';

/**
 * Generic project page. Looks up the case-study data for the current route
 * slug (the part after /projects/) and renders it in the standard template.
 * Returns null when there is no case study for the slug so the caller can
 * fall back to the legacy page.
 */
export default function ProjectCaseStudy() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/projects\//, '').replace(/\/$/, '');
  const data = caseStudies[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!data) return null;
  return <CaseStudyEditorial data={data} />;
}
