"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Label, Tooltip, Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import api from "@/utils/axios";
import Link from "next/link";
import { useToast } from "@/app/components/toast/ToastManager";
import Loader from "@/app/components/Loader";

interface Candidate {
  [key: string]: any; // Allow any data structure
}

function generateUniqueId(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result + '-' + Date.now();
}

const CandidateDetails = () => {
  const searchParams = useSearchParams();
  const searchParamsData = searchParams?.get("data");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
const { showToast } = useToast();
  useEffect(() => {
    if (searchParamsData) {
      try {
        const jsonStr = Buffer.from(searchParamsData, "base64").toString();
        const decodedData = JSON.parse(jsonStr);
        // Remove unnecessary IDs
        const {candidateId, id, clientId, taskId, ...cleanData } = decodedData;
        setCandidate(cleanData);
      } catch (error) {
        console.error("Failed to decode candidate data:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [searchParamsData]);

 		const handleDownloadClick = async () => {
			try {
				if (candidate?.documentUrl) {
				const response = await fetch(candidate.documentUrl);
				if (!response.ok) {
					throw new Error("Failed to fetch the file");
				}

				const blob = await response.blob();
				const blobUrl = window.URL.createObjectURL(blob);

				const link = document.createElement('a');
				link.href = blobUrl;
				link.setAttribute('download', `candidate_${candidate?.fullName}_resume.pdf`);
				document.body.appendChild(link);
				link.click();

				document.body.removeChild(link);
				window.URL.revokeObjectURL(blobUrl); // Clean up
				} else {
				showToast("Resume download URL not available", "error");
				}
			} catch (error) {
				console.error("Download error:", error);
				showToast("Error downloading resume", "error");
			}
		};

  const renderField = (label: string, value: any, className: string = "") => {
    if (value === undefined || value === null || value === "" || 
        (Array.isArray(value) && value.length === 0) || 
        (typeof value === 'object' && Object.keys(value).length === 0)) {
      return (
        <div className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 ${className}`} key={generateUniqueId()}>
          <Label className="w-full sm:w-32 text-gray-700 break-words shrink-0">{label}</Label>
          <span className="hidden sm:inline shrink-0">:</span>
          <span className="break-words overflow-hidden text-ellipsis">N/A</span>
        </div>
      );
    }
    return (
      <div className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 ${className}`} key={generateUniqueId()}>
        <Label className="w-full sm:w-32 text-gray-700 break-words shrink-0">{label}</Label>
        <span className="hidden sm:inline shrink-0">:</span>
        {/* <span className="break-words overflow-hidden text-ellipsis">{value}</span> */}
		   <span className="break-words overflow-hidden text-ellipsis">
       		 {Array.isArray(value) ? value.join(', ') : value}
      		</span>
      </div>
    );
  };

  const renderArrayField = (label: string, items: any[] = [], renderItem: (item: any, index: number) => React.ReactNode) => {
    if (!items?.length) {
      return (
        <div>
          <Label className="text-gray-700">{label}</Label>
          <div className="mt-2">N/A</div>
        </div>
      );
    }
    return (
      <div>
        <Label className="text-gray-700">{label}</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((item, index) => renderItem(item ?? 'N/A', index))}
        </div>
      </div>
    );
  };

  const renderBasicInfo = () => {
    const basicFields = [
      'fullName', 'firstName', 'lastName', 'email', 'phone', 
      'currentTitle', 'totalYearsExperience', 'linkedinUrl'
    ];

    return (
      <div className="space-y-4">
        {basicFields.map(field => renderField(
          field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          candidate?.[field] ?? 'N/A',
          field === 'totalYearsExperience' ? 'after:content-[""] after:ml-1' : ''
        ))}
        {renderField(
          'Location',
          [candidate?.city, candidate?.state, candidate?.country].filter(Boolean).join(', ') || 'N/A'
        )}
      </div>
    );
  };

  const renderSkillsAndCertifications = () => {
    return (
      <div className="space-y-4">
        {renderArrayField('Skills', candidate?.skillKeywords, (skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-lightprimary text-primary rounded-full text-sm"
          >
            {skill ?? 'N/A'}
          </span>
        ))}
        {renderArrayField('Certifications', candidate?.certifications, (cert, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-lightprimary text-primary rounded-full text-sm"
          >
            {cert ?? 'N/A'}
          </span>
        ))}
        {renderField('Languages', candidate?.languagesSpoken ?? 'N/A')}
      </div>
    );
  };

  const renderTimelineItem = (item: any = {}, index: number, type: 'primary' | 'secondary') => {
    const borderColor = type === 'primary' ? 'border-primary' : 'border-secondary';
    
    return (
      <div key={index} className={`border-l-4 ${borderColor} pl-4`}>
        {Object.entries(item).map(([key, value]) => {
          if (typeof value !== 'string') return null;
          
          if (key.includes('_at') || key.includes('date')) return null;
          
          const displayValue = value || 'N/A';
          
          if (key === 'description') {
            return <p key={key} className="mt-2 text-gray-700 break-words whitespace-pre-wrap">{displayValue}</p>;
          }
          if (key === 'title' || key === 'school') {
            return <h3 key={key} className="font-semibold text-lg break-words">{displayValue}</h3>;
          }
          if (key === 'company_name' || key === 'degree_name') {
            return <p key={key} className="text-gray-600 break-words">{displayValue}</p>;
          }
          if (key === 'company_location' || key === 'field_of_study') {
            return <p key={key} className="text-sm text-gray-500 break-words">{displayValue}</p>;
          }
          
          return <p key={key} className="text-sm text-gray-500 break-words">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {displayValue}
          </p>;
        })}
        
        <p className="text-sm text-gray-500 break-words">
          {item?.starts_at ?? 'N/A'} - {item?.ends_at || "Present"}
        </p>
      </div>
    );
  };

  const renderExperience = () => {
    if (!candidate?.experienceDetails?.length) {
      return <p>N/A</p>;
    }
    return (
      <div className="space-y-6">
        {candidate.experienceDetails.map((exp, index) => renderTimelineItem(exp, index, 'primary'))}
      </div>
    );
  };

  const renderEducation = () => {
    if (!candidate?.educationDetails?.length) {
      return <p>N/A</p>;
    }
    return (
      <div className="space-y-6">
        {candidate.educationDetails.map((edu, index) => renderTimelineItem(edu, index, 'secondary'))}
      </div>
    );
  };

  const renderAdditionalSections = () => {
    const mainKeys = new Set([
      'id', 'clientId', 'taskId', 'sourceType', 'fullName', 'firstName', 'lastName', 'email', 'phone',
      'linkedinUrl', 'city', 'state', 'country', 'currentTitle', 'totalYearsExperience',
      'experienceDetails', 'skillKeywords', 'certifications', 'languagesSpoken',
      'educationDetails', 'candidateSummary', 'documentUrl'
    ]);

    const additionalSections = Object.entries(candidate || {})
      .filter(([key]) => !mainKeys.has(key) && typeof candidate?.[key] !== 'function')
      .filter(([_, value]) => value !== null && value !== undefined && value !== '');

    if (!additionalSections.length) return null;

    return (
      <>
	   {/* Meta Tags */}
	   
        {additionalSections.map(([key, value]) => (
          <Card key={key} className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h2>
            {Array.isArray(value) ? (
              <div className="space-y-4" key={key}>
                {value?.length ? value.map((item, index) => (
                  <div key={index} className="p-4 bg-lightgray rounded-lg">
                    {typeof item === 'object' ? (
                      Object.entries(item).map(([itemKey, itemValue]) => (
                        <p key={itemKey} className="mb-2">
                          <span className="font-medium">
                            {itemKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                          </span>{' '}
                          {String(itemValue) ?? 'N/A'}
                        </p>
                      ))
                    ) : (
                      <p>{item ?? 'N/A'}</p>
                    )}
                  </div>
                )) : <p>N/A</p>}
              </div>
            ) : (
              <p className="text-gray-700">{value ?? 'N/A'}</p>
            )}
          </Card>
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <Loader color="primary" />
    );
  }

  if (!candidate) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Candidate not found</p>
      </div>
    );
  }

  return (
	<>
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/talent-pool" 
          className="inline-flex items-center text-primary hover:text-primary-emphasis mb-4"
        >
          <Icon icon="mdi:arrow-left" className="mr-2" width={20} />
          Back to Talent Pool
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
              Candidate Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 break-words">
              Detailed information about {candidate?.fullName ?? candidate?.firstName ?? 'N/A'}
            </p>
          </div>
          {candidate?.documentUrl && (
            <Button
              color="primary"
              onClick={handleDownloadClick}
              className="flex items-center gap-2 w-full sm:w-auto shrink-0"
            >
              <Icon icon="solar:cloud-download-broken" width={20} />
              Download Resume
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="h-full">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-3 sm:space-y-4">
            {renderBasicInfo()}
          </div>
        </Card>

        <Card className="h-full">
          <h2 className="text-xl font-semibold mb-4">Skills & Certifications</h2>
          <div className="space-y-3 sm:space-y-4">
            {renderSkillsAndCertifications()}
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
          <div className="space-y-4 sm:space-y-6">
            {renderExperience()}
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Education</h2>
          <div className="space-y-4 sm:space-y-6">
            {renderEducation()}
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Professional Summary</h2>
          <p className="text-gray-700 whitespace-pre-line break-words">
            {candidate?.candidateSummary ?? 'N/A'}
          </p>
        </Card>

        {renderAdditionalSections()}
      </div>
    </div>
	</>
  );
};

export default CandidateDetails;
