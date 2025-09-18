// // // import React, { useState, useEffect } from 'react';

// // // // The "import process from 'process';" line is not needed and causes a Webpack error.
// // // // Create React App handles process.env directly without an explicit import.

// // // function Dashboard() {
// // //   const [metadataList, setMetadataList] = useState([]);
// // //   const [isLoading, setIsLoading] = useState(true);
// // //   const [error, setError] = useState(null);

// // //   useEffect(() => {
// // //     const fetchMetadata = async () => {
// // //       // Access the environment variable correctly using process.env
// // //       // This will be replaced with the value from your .env file at build time.
// // //       const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/metadata`;
      
// // //       try {
// // //         setIsLoading(true);
// // //         setError(null);
        
// // //         const response = await fetch(API_URL);

// // //         if (!response.ok) {
// // //           // Attempt to parse JSON error message if available, otherwise use a generic message
// // //           const errorStatus = response.status;
// // //           const errorText = await response.text();
// // //           let errorMessage;

// // //           try {
// // //             const errorData = JSON.parse(errorText);
// // //             errorMessage = errorData.error || `HTTP error! Status: ${errorStatus}`;
// // //           } catch {
// // //             errorMessage = `HTTP error! Status: ${errorStatus}. Server response: ${errorText.substring(0, 100)}`;
// // //           }

// // //           throw new Error(errorMessage);
// // //         }

// // //         const data = await response.json();
        
// // //         if (data.success) {
// // //           setMetadataList(data.data);
// // //         } else {
// // //           throw new Error(data.error || 'Failed to load metadata');
// // //         }
// // //       } catch (err) {
// // //         console.error('Fetch error:', err);
// // //         setError(err.message || 'An unexpected error occurred.');
// // //       } finally {
// // //         setIsLoading(false);
// // //       }
// // //     };

// // //     fetchMetadata();
// // //   }, []);

// // //   const countMetrics = (item) => {
// // //     let fillerWordsCount = 0;
// // //     let pausesCount = 0;

// // //     if (item.deepgram_words && item.deepgram_words.length > 0) {
// // //       const fillerWords = ['uh', 'um', 'like', 'you know', 'so', 'and', 'but', 'well'];
// // //       fillerWordsCount = item.deepgram_words.filter(word => 
// // //         fillerWords.includes(word.word.toLowerCase())
// // //       ).length;
// // //     }

// // //     if (item.deepgram_transcript) {
// // //       const pauses = item.deepgram_transcript.match(/\[PAUSE:.*?\]/g);
// // //       if (pauses) {
// // //         pausesCount = pauses.length;
// // //       }
// // //     }

// // //     return { fillerWordsCount, pausesCount };
// // //   };

// // //   const getFluencyVariant = (score) => {
// // //     if (score >= 90) return 'bg-success';
// // //     if (score >= 70) return 'bg-warning';
// // //     return 'bg-danger';
// // //   };

// // //   const formatDate = (dateString) => {
// // //     return new Date(dateString).toLocaleString('en-US', {
// // //       year: 'numeric',
// // //       month: 'short',
// // //       day: 'numeric',
// // //       hour: '2-digit',
// // //       minute: '2-digit'
// // //     });
// // //   };

// // //   return (
// // //     <div style={{ minHeight: '100vh', backgroundColor: '#133c65ff' }}>
// // //       {/* Modern Header with Gradient Background */}
// // //       <div style={{
// // //         background: 'linear-gradient(135deg, #191f39ff 0%, #2d65a4ff 100%)',
// // //         padding: '4rem 0',
// // //         marginBottom: '2rem'
// // //       }}>
// // //         <div className="container">
// // //           <div className="text-center text-white">
// // //             <h1 className="display-4 fw-bold mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
// // //               📊 Video Analytics Dashboard
// // //             </h1>
// // //             <p className="lead mb-0" style={{ fontSize: '1.25rem', opacity: 0.9 }}>
// // //               Professional insights from your video content with advanced speech analytics
// // //             </p>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <div className="container pb-5">
// // //         {/* Enhanced Loading State */}
// // //         {isLoading && (
// // //           <div className="text-center py-5">
// // //             <div className="d-inline-flex align-items-center bg-white rounded-pill px-4 py-3 shadow-sm">
// // //               <div className="spinner-border spinner-border-sm text-primary me-3" role="status">
// // //                 <span className="visually-hidden">Loading...</span>
// // //               </div>
// // //               <span className="h6 mb-0 text-primary">Analyzing your videos...</span>
// // //             </div>
// // //           </div>
// // //         )}

// // //         {/* Enhanced Error State */}
// // //         {error && (
// // //           <div className="alert alert-danger shadow-sm border-0 rounded-3" role="alert">
// // //             <div className="d-flex">
// // //               <div className="flex-shrink-0">
// // //                 <i className="fas fa-exclamation-triangle fa-2x text-danger"></i>
// // //               </div>
// // //               <div className="flex-grow-1 ms-3">
// // //                 <h4 className="alert-heading fw-bold">⚠️ Connection Error</h4>
// // //                 <p className="mb-0">Unable to fetch analytics data: <strong>{error}</strong></p>
// // //                 <hr />
// // //                 <p className="mb-0 small">Please check your connection and try refreshing the page.</p>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         )}

// // //         {/* Main Content */}
// // //         {!isLoading && !error && (
// // //           <>
// // //             {metadataList.length > 0 ? (
// // //               <div className="row g-4">
// // //                 {metadataList.map(item => {
// // //                   const { fillerWordsCount, pausesCount } = countMetrics(item);
// // //                   const totalWords = item.deepgram_words ? item.deepgram_words.length : 0;
// // //                   const fluencyScore = totalWords > 0 
// // //                     ? ((totalWords - fillerWordsCount) / totalWords) * 100 
// // //                     : 100;

// // //                   return (
// // //                     <div key={item.id} className="col-12">
// // //                       <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
// // //                         {/* Premium Card Header */}
// // //                         <div style={{
// // //                           background: 'linear-gradient(135deg, #2d68baff 0%, #111216ff 100%)',
// // //                           padding: '1.5rem'
// // //                         }}>
// // //                           <div className="row align-items-center">
// // //                             <div className="col">
// // //                               <h3 className="text-white fw-bold mb-1">
// // //                                 🎥 {item.original_name}
// // //                               </h3>
// // //                               <p className="text-white-50 mb-0">
// // //                                 📅 Uploaded: {formatDate(item.created_at)}
// // //                               </p>
// // //                             </div>
// // //                             <div className="col-auto">
// // //                               <span className={`badge rounded-pill px-3 py-2 text-white ${getFluencyVariant(fluencyScore)}`}>
// // //                                 <i className="fas fa-chart-line me-2"></i>
// // //                                 {fluencyScore.toFixed(1)}% Fluency
// // //                               </span>
// // //                             </div>
// // //                           </div>
// // //                         </div>

// // //                         <div className="card-body p-4">
// // //                           <div className="row g-4">
// // //                             {/* Video Preview Section */}
// // //                             <div className="col-lg-6">
// // //                               <div className="mb-4">
// // //                                 <h5 className="fw-bold text-dark mb-3">
// // //                                   <i className="fas fa-play-circle text-primary me-2"></i>
// // //                                   Video Preview
// // //                                 </h5>
// // //                                 <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow-sm">
// // //                                   <video 
// // //                                     controls 
// // //                                     src={item.video_url} 
// // //                                     className="rounded-3"
// // //                                     style={{ objectFit: 'cover' }}
// // //                                   />
// // //                                 </div>
// // //                               </div>
// // //                             </div>

// // //                             {/* Analytics Metrics */}
// // //                             <div className="col-lg-6">
// // //                               <h5 className="fw-bold text-dark mb-3">
// // //                                 <i className="fas fa-chart-bar text-success me-2"></i>
// // //                                 Speech Analytics
// // //                               </h5>
// // //                               <div className="row g-3">
// // //                                 <div className="col-6">
// // //                                   <div className="card bg-light border-0 h-100">
// // //                                     <div className="card-body text-center p-3">
// // //                                       <div className="text-primary display-6 fw-bold">{totalWords}</div>
// // //                                       <small className="text-muted fw-semibold">Total Words</small>
// // //                                     </div>
// // //                                   </div>
// // //                                 </div>
// // //                                 <div className="col-6">
// // //                                   <div className="card bg-warning bg-opacity-10 border-0 h-100">
// // //                                     <div className="card-body text-center p-3">
// // //                                       <div className="text-warning display-6 fw-bold">{fillerWordsCount}</div>
// // //                                       <small className="text-warning fw-semibold">Filler Words</small>
// // //                                       <div className="mt-1">
// // //                                         <small className="badge bg-warning bg-opacity-20 text-warning">
// // //                                           {totalWords > 0 ? `${((fillerWordsCount / totalWords) * 100).toFixed(1)}%` : '0%'}
// // //                                         </small>
// // //                                       </div>
// // //                                     </div>
// // //                                   </div>
// // //                                 </div>
// // //                                 <div className="col-12">
// // //                                   <div className="card bg-info bg-opacity-10 border-0">
// // //                                     <div className="card-body text-center p-3">
// // //                                       <div className="text-info display-6 fw-bold">{pausesCount}</div>
// // //                                       <small className="text-info fw-semibold">
// // //                                         Speech Pause{pausesCount !== 1 ? 's' : ''}
// // //                                       </small>
// // //                                     </div>
// // //                                   </div>
// // //                                 </div>
// // //                               </div>
// // //                             </div>
// // //                           </div>

// // //                           {/* Transcript Section */}
// // //                           <div className="mt-4">
// // //                             <h5 className="fw-bold text-dark mb-3">
// // //                               <i className="fas fa-quote-left text-info me-2"></i>
// // //                               Transcript
// // //                             </h5>
// // //                             <div className="card bg-light border-0">
// // //                               <div className="card-body">
// // //                                 <blockquote className="blockquote mb-0">
// // //                                   <p className="text-dark" style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
// // //                                     "{item.deepgram_transcript || 'No transcript available.'}"
// // //                                   </p>
// // //                                 </blockquote>
// // //                               </div>
// // //                             </div>
// // //                           </div>

// // //                           {/* Key Frames Section */}
// // //                           <div className="mt-4">
// // //                             <h5 className="fw-bold text-dark mb-3">
// // //                               <i className="fas fa-images text-secondary me-2"></i>
// // //                               Key Frames ({item.frames ? item.frames.length : 0})
// // //                             </h5>
// // //                             {item.frames && item.frames.length > 0 ? (
// // //                               <div className="row g-3">
// // //                                 {item.frames.map((frame, index) => (
// // //                                   <div key={index} className="col-6 col-md-4 col-lg-3 col-xl-2">
// // //                                     <a 
// // //                                       href={frame.frame_url} 
// // //                                       target="_blank" 
// // //                                       rel="noopener noreferrer"
// // //                                       className="d-block text-decoration-none"
// // //                                     >
// // //                                       <div className="card border-0 shadow-sm h-100 hover-lift" style={{
// // //                                         transition: 'transform 0.2s ease-in-out',
// // //                                         cursor: 'pointer'
// // //                                       }}
// // //                                       onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
// // //                                       onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
// // //                                       >
// // //                                         <img
// // //                                           src={frame.frame_url}
// // //                                           alt={`Frame ${index + 1}`}
// // //                                           className="card-img-top rounded-3"
// // //                                           style={{ 
// // //                                             height: '80px', 
// // //                                             objectFit: 'cover',
// // //                                             aspectRatio: '16/9'
// // //                                           }}
// // //                                         />
// // //                                         <div className="card-body p-2 text-center">
// // //                                           <small className="text-muted fw-semibold">Frame {index + 1}</small>
// // //                                         </div>
// // //                                       </div>
// // //                                     </a>
// // //                                   </div>
// // //                                 ))}
// // //                               </div>
// // //                             ) : (
// // //                               <div className="text-center py-4">
// // //                                 <i className="fas fa-image fa-3x text-muted mb-3"></i>
// // //                                 <p className="text-muted mb-0">No key frames extracted from this video.</p>
// // //                               </div>
// // //                             )}
// // //                           </div>
// // //                         </div>
// // //                       </div>
// // //                     </div>
// // //                   );
// // //                 })}
// // //               </div>
// // //             ) : (
// // //               <div className="text-center py-5">
// // //                 <div className="card border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: '500px' }}>
// // //                   <div className="card-body p-5">
// // //                     <i className="fas fa-video fa-4x text-muted mb-4"></i>
// // //                     <h4 className="fw-bold text-dark mb-3">No Videos Found</h4>
// // //                     <p className="text-muted mb-4">
// // //                       Upload your first video to start analyzing speech patterns and extract valuable insights.
// // //                     </p>
// // //                     <button className="btn btn-primary btn-lg rounded-pill px-4">
// // //                       <i className="fas fa-upload me-2"></i>
// // //                       Upload Video
// // //                     </button>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             )}
// // //           </>
// // //         )}
// // //       </div>

// // //       {/* Custom Styles */}
// // //       <style jsx>{`
// // //         .hover-lift:hover {
// // //           transform: translateY(-5px);
// // //           box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
// // //         }
        
// // //         .card {
// // //           transition: all 0.3s ease;
// // //         }
        
// // //         .display-6 {
// // //           font-size: 2rem;
// // //         }
        
// // //         @media (max-width: 768px) {
// // //           .display-4 {
// // //             font-size: 2rem !important;
// // //           }
          
// // //           .lead {
// // //             font-size: 1.1rem !important;
// // //           }
// // //         }
// // //       `}</style>
// // //     </div>
// // //   );
// // // }

// // // export default Dashboard;

// // import React, { useState, useEffect } from 'react';

// // function Dashboard() {
// //   const [metadataList, setMetadataList] = useState([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     const fetchMetadata = async () => {
// //       const API_URL = 'http://localhost:/api/metadata';
      
// //       try {
// //         setIsLoading(true);
// //         setError(null);
        
// //         const response = await fetch(API_URL);

// //         if (!response.ok) {
// //           const errorStatus = response.status;
// //           const errorMessage = await response.json().then(data => data.error || `HTTP error! Status: ${errorStatus}`);
// //           throw new Error(errorMessage);
// //         }

// //         const data = await response.json();
        
// //         if (data.success) {
// //           setMetadataList(data.data);
// //         } else {
// //           throw new Error(data.error || 'Failed to load metadata');
// //         }
// //       } catch (err) {
// //         console.error('Fetch error:', err);
// //         setError(err.message || 'An unexpected error occurred.');
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchMetadata();
// //   }, []);

// //   const countMetrics = (item) => {
// //     let fillerWordsCount = 0;
// //     let pausesCount = 0;

// //     if (item.deepgram_words && item.deepgram_words.length > 0) {
// //       const fillerWords = ['uh', 'um', 'like', 'you know', 'so', 'and', 'but', 'well'];
// //       fillerWordsCount = item.deepgram_words.filter(word => 
// //         fillerWords.includes(word.word.toLowerCase())
// //       ).length;
// //     }

// //     if (item.deepgram_transcript) {
// //       const pauses = item.deepgram_transcript.match(/\[PAUSE:.*?\]/g);
// //       if (pauses) {
// //         pausesCount = pauses.length;
// //       }
// //     }

// //     return { fillerWordsCount, pausesCount };
// //   };

// //   const getFluencyVariant = (score) => {
// //     if (score >= 90) return 'bg-success';
// //     if (score >= 70) return 'bg-warning';
// //     return 'bg-danger';
// //   };

// //   const formatDate = (dateString) => {
// //     return new Date(dateString).toLocaleString('en-US', {
// //       year: 'numeric',
// //       month: 'short',
// //       day: 'numeric',
// //       hour: '2-digit',
// //       minute: '2-digit'
// //     });
// //   };

// //   return (
// //     <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
// //       {/* Modern Header with Gradient Background */}
// //       <div style={{
// //         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
// //         padding: '4rem 0',
// //         marginBottom: '2rem'
// //       }}>
// //         <div className="container">
// //           <div className="text-center text-white">
// //             <h1 className="display-4 fw-bold mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
// //               📊 Video Analytics Dashboard
// //             </h1>
// //             <p className="lead mb-0" style={{ fontSize: '1.25rem', opacity: 0.9 }}>
// //               Professional insights from your video content with advanced speech analytics
// //             </p>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="container pb-5">
// //         {/* Enhanced Loading State */}
// //         {isLoading && (
// //           <div className="text-center py-5">
// //             <div className="d-inline-flex align-items-center bg-white rounded-pill px-4 py-3 shadow-sm">
// //               <div className="spinner-border spinner-border-sm text-primary me-3" role="status">
// //                 <span className="visually-hidden">Loading...</span>
// //               </div>
// //               <span className="h6 mb-0 text-primary">Analyzing your videos...</span>
// //             </div>
// //           </div>
// //         )}

// //         {/* Enhanced Error State */}
// //         {error && (
// //           <div className="alert alert-danger shadow-sm border-0 rounded-3" role="alert">
// //             <div className="d-flex">
// //               <div className="flex-shrink-0">
// //                 <i className="fas fa-exclamation-triangle fa-2x text-danger"></i>
// //               </div>
// //               <div className="flex-grow-1 ms-3">
// //                 <h4 className="alert-heading fw-bold">⚠️ Connection Error</h4>
// //                 <p className="mb-0">Unable to fetch analytics data: <strong>{error}</strong></p>
// //                 <hr />
// //                 <p className="mb-0 small">Please check your connection and try refreshing the page.</p>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Main Content */}
// //         {!isLoading && !error && (
// //           <>
// //             {metadataList.length > 0 ? (
// //               <div className="row g-4">
// //                 {metadataList.map(item => {
// //                   const { fillerWordsCount, pausesCount } = countMetrics(item);
// //                   const totalWords = item.deepgram_words ? item.deepgram_words.length : 0;
// //                   const fluencyScore = totalWords > 0 
// //                     ? ((totalWords - fillerWordsCount) / totalWords) * 100 
// //                     : 100;

// //                   return (
// //                     <div key={item.id} className="col-12">
// //                       <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
// //                         {/* Premium Card Header */}
// //                         <div style={{
// //                           background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
// //                           padding: '1.5rem'
// //                         }}>
// //                           <div className="row align-items-center">
// //                             <div className="col">
// //                               <h3 className="text-white fw-bold mb-1">
// //                                 🎥 {item.original_name}
// //                               </h3>
// //                               <p className="text-white-50 mb-0">
// //                                 📅 Uploaded: {formatDate(item.created_at)}
// //                               </p>
// //                             </div>
// //                             <div className="col-auto">
// //                               <span className={`badge rounded-pill px-3 py-2 text-white ${getFluencyVariant(fluencyScore)}`}>
// //                                 <i className="fas fa-chart-line me-2"></i>
// //                                 {fluencyScore.toFixed(1)}% Fluency
// //                               </span>
// //                             </div>
// //                           </div>
// //                         </div>

// //                         <div className="card-body p-4">
// //                           <div className="row g-4">
// //                             {/* Video Preview Section */}
// //                             <div className="col-lg-6">
// //                               <div className="mb-4">
// //                                 <h5 className="fw-bold text-dark mb-3">
// //                                   <i className="fas fa-play-circle text-primary me-2"></i>
// //                                   Video Preview
// //                                 </h5>
// //                                 <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow-sm">
// //                                   <video 
// //                                     controls 
// //                                     src={item.video_url} 
// //                                     className="rounded-3"
// //                                     style={{ objectFit: 'cover' }}
// //                                   />
// //                                 </div>
// //                               </div>
// //                             </div>

// //                             {/* Analytics Metrics */}
// //                             <div className="col-lg-6">
// //                               <h5 className="fw-bold text-dark mb-3">
// //                                 <i className="fas fa-chart-bar text-success me-2"></i>
// //                                 Speech Analytics
// //                               </h5>
// //                               <div className="row g-3">
// //                                 <div className="col-6">
// //                                   <div className="card bg-light border-0 h-100">
// //                                     <div className="card-body text-center p-3">
// //                                       <div className="text-primary display-6 fw-bold">{totalWords}</div>
// //                                       <small className="text-muted fw-semibold">Total Words</small>
// //                                     </div>
// //                                   </div>
// //                                 </div>
// //                                 <div className="col-6">
// //                                   <div className="card bg-warning bg-opacity-10 border-0 h-100">
// //                                     <div className="card-body text-center p-3">
// //                                       <div className="text-warning display-6 fw-bold">{fillerWordsCount}</div>
// //                                       <small className="text-warning fw-semibold">Filler Words</small>
// //                                       <div className="mt-1">
// //                                         <small className="badge bg-warning bg-opacity-20 text-warning">
// //                                           {totalWords > 0 ? `${((fillerWordsCount / totalWords) * 100).toFixed(1)}%` : '0%'}
// //                                         </small>
// //                                       </div>
// //                                     </div>
// //                                   </div>
// //                                 </div>
// //                                 <div className="col-12">
// //                                   <div className="card bg-info bg-opacity-10 border-0">
// //                                     <div className="card-body text-center p-3">
// //                                       <div className="text-info display-6 fw-bold">{pausesCount}</div>
// //                                       <small className="text-info fw-semibold">
// //                                         Speech Pause{pausesCount !== 1 ? 's' : ''}
// //                                       </small>
// //                                     </div>
// //                                   </div>
// //                                 </div>
// //                               </div>
// //                             </div>
// //                           </div>

// //                           {/* Transcript Section */}
// //                           <div className="mt-4">
// //                             <h5 className="fw-bold text-dark mb-3">
// //                               <i className="fas fa-quote-left text-info me-2"></i>
// //                               Transcript
// //                             </h5>
// //                             <div className="card bg-light border-0">
// //                               <div className="card-body">
// //                                 <blockquote className="blockquote mb-0">
// //                                   <p className="text-dark" style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
// //                                     "{item.deepgram_transcript || 'No transcript available.'}"
// //                                   </p>
// //                                 </blockquote>
// //                               </div>
// //                             </div>
// //                           </div>

// //                           {/* Key Frames Section */}
// //                           <div className="mt-4">
// //                             <h5 className="fw-bold text-dark mb-3">
// //                               <i className="fas fa-images text-secondary me-2"></i>
// //                               Key Frames ({item.frames ? item.frames.length : 0})
// //                             </h5>
// //                             {item.frames && item.frames.length > 0 ? (
// //                               <div className="row g-3">
// //                                 {item.frames.map((frame, index) => (
// //                                   <div key={index} className="col-6 col-md-4 col-lg-3 col-xl-2">
// //                                     <a 
// //                                       href={frame.frame_url} 
// //                                       target="_blank" 
// //                                       rel="noopener noreferrer"
// //                                       className="d-block text-decoration-none"
// //                                     >
// //                                       <div className="card border-0 shadow-sm h-100 hover-lift" style={{
// //                                         transition: 'transform 0.2s ease-in-out',
// //                                         cursor: 'pointer'
// //                                       }}
// //                                       onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
// //                                       onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
// //                                       >
// //                                         <img
// //                                           src={frame.frame_url}
// //                                           alt={`Frame ${index + 1}`}
// //                                           className="card-img-top rounded-3"
// //                                           style={{ 
// //                                             height: '80px', 
// //                                             objectFit: 'cover',
// //                                             aspectRatio: '16/9'
// //                                           }}
// //                                         />
// //                                         <div className="card-body p-2 text-center">
// //                                           <small className="text-muted fw-semibold">Frame {index + 1}</small>
// //                                         </div>
// //                                       </div>
// //                                     </a>
// //                                   </div>
// //                                 ))}
// //                               </div>
// //                             ) : (
// //                               <div className="text-center py-4">
// //                                 <i className="fas fa-image fa-3x text-muted mb-3"></i>
// //                                 <p className="text-muted mb-0">No key frames extracted from this video.</p>
// //                               </div>
// //                             )}
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   );
// //                 })}
// //               </div>
// //             ) : (
// //               <div className="text-center py-5">
// //                 <div className="card border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: '500px' }}>
// //                   <div className="card-body p-5">
// //                     <i className="fas fa-video fa-4x text-muted mb-4"></i>
// //                     <h4 className="fw-bold text-dark mb-3">No Videos Found</h4>
// //                     <p className="text-muted mb-4">
// //                       Upload your first video to start analyzing speech patterns and extract valuable insights.
// //                     </p>
// //                     <button className="btn btn-primary btn-lg rounded-pill px-4">
// //                       <i className="fas fa-upload me-2"></i>
// //                       Upload Video
// //                     </button>
// //                   </div>
// //                 </div>
// //               </div>
// //             )}
// //           </>
// //         )}
// //       </div>

// //       {/* Custom Styles */}
// //       <style jsx>{`
// //         .hover-lift:hover {
// //           transform: translateY(-5px);
// //           box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
// //         }
        
// //         .card {
// //           transition: all 0.3s ease;
// //         }
        
// //         .display-6 {
// //           font-size: 2rem;
// //         }
        
// //         @media (max-width: 768px) {
// //           .display-4 {
// //             font-size: 2rem !important;
// //           }
          
// //           .lead {
// //             font-size: 1.1rem !important;
// //           }
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }

// // export default Dashboard;




// import React, { useState, useEffect } from 'react';

// function Dashboard() {
//   const [metadataList, setMetadataList] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchMetadata = async () => {
//       const API_URL = 'http://localhost:7000/api/metadata'; // ✅ Correct port

//       try {
//         setIsLoading(true);
//         setError(null);

//         const response = await fetch(API_URL, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//           }
//         });

//         if (!response.ok) {
//           const errorStatus = response.status;
//           let errorMessage = `HTTP error! Status: ${errorStatus}`;
//           try {
//             const errorData = await response.json();
//             errorMessage = errorData.error || errorMessage;
//           } catch {
//             // fallback if error JSON not parsable
//           }
//           throw new Error(errorMessage);
//         }

//         const data = await response.json();

//         if (data.success) {
//           setMetadataList(data.data || []);
//         } else {
//           throw new Error(data.error || 'Failed to load metadata');
//         }
//       } catch (err) {
//         setError(err.message || 'An unexpected error occurred.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchMetadata();
//   }, []);

//   const countMetrics = (item) => {
//     let fillerWordsCount = 0;
//     let pausesCount = 0;

//     if (item.deepgram_words && item.deepgram_words.length > 0) {
//       const fillerWords = ['uh', 'um', 'like', 'you know', 'so', 'and', 'but', 'well'];
//       fillerWordsCount = item.deepgram_words.filter(word =>
//         fillerWords.includes(word.word?.toLowerCase())
//       ).length;
//     }

//     if (item.deepgram_transcript) {
//       const pauses = item.deepgram_transcript.match(/\[PAUSE:.*?\]/g);
//       if (pauses) {
//         pausesCount = pauses.length;
//       }
//     }

//     return { fillerWordsCount, pausesCount };
//   };

//   const getFluencyVariant = (score) => {
//     if (score >= 90) return 'bg-success';
//     if (score >= 70) return 'bg-warning';
//     return 'bg-danger';
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
//       {/* Header */}
//       <div
//         style={{
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           padding: '4rem 0',
//           marginBottom: '2rem'
//         }}
//       >
//         <div className="container">
//           <div className="text-center text-white">
//             <h1
//               className="display-4 fw-bold mb-4"
//               style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
//             >
//               Video Analytics Dashboard
//             </h1>
//             <p className="lead mb-0" style={{ fontSize: '1.25rem', opacity: 0.9 }}>
//               Professional insights from your video content with advanced speech analytics
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="container pb-5">
//         {/* Loading */}
//         {isLoading && (
//           <div className="text-center py-5">
//             <div className="d-inline-flex align-items-center bg-white rounded-pill px-4 py-3 shadow-sm">
//               <div className="spinner-border spinner-border-sm text-primary me-3" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//               <span className="h6 mb-0 text-primary">Analyzing your videos...</span>
//             </div>
//           </div>
//         )}

//         {/* Error */}
//         {error && (
//           <div className="alert alert-danger shadow-sm border-0 rounded-3" role="alert">
//             <div className="d-flex">
//               <div className="flex-shrink-0" style={{ fontSize: '2rem' }}>⚠️</div>
//               <div className="flex-grow-1 ms-3">
//                 <h4 className="alert-heading fw-bold">Connection Error</h4>
//                 <p className="mb-0">Unable to fetch analytics data: <strong>{error}</strong></p>
//                 <hr />
//                 <p className="mb-0 small">
//                   Make sure your backend server is running on port 7000. Try: <code>node index.js</code>
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Main Content */}
//         {!isLoading && !error && (
//           <>
//             {metadataList.length > 0 ? (
//               <div className="row g-4">
//                 {metadataList.map(item => {
//                   const { fillerWordsCount, pausesCount } = countMetrics(item);
//                   const totalWords = item.deepgram_words ? item.deepgram_words.length : 0;
//                   const fluencyScore = totalWords > 0
//                     ? ((totalWords - fillerWordsCount) / totalWords) * 100
//                     : 100;

//                   return (
//                     <div key={item.id} className="col-12">
//                       <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
//                         {/* Card Header */}
//                         <div
//                           style={{
//                             background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
//                             padding: '1.5rem'
//                           }}
//                         >
//                           <div className="row align-items-center">
//                             <div className="col">
//                               <h3 className="text-white fw-bold mb-1">
//                                 🎥 {item.original_name || item.video_name}
//                               </h3>
//                               <p className="text-white-50 mb-0">
//                                 📅 Uploaded: {formatDate(item.created_at)}
//                               </p>
//                             </div>
//                             <div className="col-auto">
//                               <span
//                                 className={`badge rounded-pill px-3 py-2 text-white ${getFluencyVariant(fluencyScore)}`}
//                               >
//                                 📈 {fluencyScore.toFixed(1)}% Fluency
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="card-body p-4">
//                           <div className="row g-4">
//                             {/* Video Preview */}
//                             <div className="col-lg-6">
//                               <div className="mb-4">
//                                 <h5 className="fw-bold text-dark mb-3">▶️ Video Preview</h5>
//                                 <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow-sm">
//                                   {item.video_url ? (
//                                     <video
//                                       controls
//                                       src={item.video_url}
//                                       className="rounded-3"
//                                       style={{ objectFit: 'cover' }}
//                                     />
//                                   ) : (
//                                     <div className="d-flex align-items-center justify-content-center bg-light rounded-3">
//                                       <span className="text-muted">No video available</span>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Analytics */}
//                             <div className="col-lg-6">
//                               <h5 className="fw-bold text-dark mb-3">📊 Speech Analytics</h5>
//                               <div className="row g-3">
//                                 <div className="col-6">
//                                   <div className="card bg-light border-0 h-100">
//                                     <div className="card-body text-center p-3">
//                                       <div className="text-primary display-6 fw-bold">{totalWords}</div>
//                                       <small className="text-muted fw-semibold">Total Words</small>
//                                     </div>
//                                   </div>
//                                 </div>
//                                 <div className="col-6">
//                                   <div className="card bg-warning bg-opacity-10 border-0 h-100">
//                                     <div className="card-body text-center p-3">
//                                       <div className="text-warning display-6 fw-bold">{fillerWordsCount}</div>
//                                       <small className="text-warning fw-semibold">Filler Words</small>
//                                       <div className="mt-1">
//                                         <small className="badge bg-warning bg-opacity-20 text-warning">
//                                           {totalWords > 0
//                                             ? `${((fillerWordsCount / totalWords) * 100).toFixed(1)}%`
//                                             : '0%'}
//                                         </small>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                                 <div className="col-12">
//                                   <div className="card bg-info bg-opacity-10 border-0">
//                                     <div className="card-body text-center p-3">
//                                       <div className="text-info display-6 fw-bold">{pausesCount}</div>
//                                       <small className="text-info fw-semibold">
//                                         Speech Pause{pausesCount !== 1 ? 's' : ''}
//                                       </small>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Transcript */}
//                           <div className="mt-4">
//                             <h5 className="fw-bold text-dark mb-3">💬 Transcript</h5>
//                             <div className="card bg-light border-0">
//                               <div className="card-body">
//                                 <blockquote className="blockquote mb-0">
//                                   <p
//                                     className="text-dark"
//                                     style={{ fontStyle: 'italic', lineHeight: '1.6' }}
//                                   >
//                                     "{item.deepgram_transcript || 'No transcript available.'}"
//                                   </p>
//                                 </blockquote>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Key Frames */}
//                           <div className="mt-4">
//                             <h5 className="fw-bold text-dark mb-3">
//                               🖼️ Key Frames ({item.frames ? item.frames.length : 0})
//                             </h5>
//                             {item.frames && item.frames.length > 0 ? (
//                               <div className="row g-3">
//                                 {item.frames.map((frame, index) => (
//                                   <div key={index} className="col-6 col-md-4 col-lg-3 col-xl-2">
//                                     <a
//                                       href={frame.frame_url}
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       className="d-block text-decoration-none"
//                                     >
//                                       <div
//                                         className="card border-0 shadow-sm h-100 hover-lift"
//                                         style={{
//                                           transition: 'transform 0.2s ease-in-out',
//                                           cursor: 'pointer'
//                                         }}
//                                         onMouseEnter={(e) =>
//                                           (e.currentTarget.style.transform = 'translateY(-5px)')
//                                         }
//                                         onMouseLeave={(e) =>
//                                           (e.currentTarget.style.transform = 'translateY(0)')
//                                         }
//                                       >
//                                         <img
//                                           src={frame.frame_url}
//                                           alt={`Frame ${index + 1}`}
//                                           className="card-img-top rounded-3"
//                                           style={{
//                                             height: '80px',
//                                             objectFit: 'cover',
//                                             aspectRatio: '16/9'
//                                           }}
//                                         />
//                                         <div className="card-body p-2 text-center">
//                                           <small className="text-muted fw-semibold">
//                                             Frame {index + 1}
//                                           </small>
//                                         </div>
//                                       </div>
//                                     </a>
//                                   </div>
//                                 ))}
//                               </div>
//                             ) : (
//                               <div className="text-center py-4">
//                                 <div style={{ fontSize: '3rem' }}>🖼️</div>
//                                 <p className="text-muted mb-0">
//                                   No key frames extracted from this video.
//                                 </p>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-5">
//                 <div
//                   className="card border-0 shadow-sm rounded-4 mx-auto"
//                   style={{ maxWidth: '500px' }}
//                 >
//                   <div className="card-body p-5">
//                     <div style={{ fontSize: '4rem' }}>🎥</div>
//                     <h4 className="fw-bold text-dark mb-3">No Videos Found</h4>
//                     <p className="text-muted mb-4">
//                       Upload your first video to start analyzing speech patterns and extract
//                       valuable insights.
//                     </p>
//                     <button className="btn btn-primary btn-lg rounded-pill px-4">
//                       📤 Upload Video
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Keyframes for subtle animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Main container for the entire dashboard
const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1a1a; /* Soft charcoal background */
  color: #c0c0c0; /* Light gray text */
  font-family: 'Satoshi', 'Inter', sans-serif;
  animation: ${fadeIn} 0.8s ease-out;
`;

// Header section with a subtle, dark gradient
const Header = styled.header`
  background: linear-gradient(135deg, #2b2b2b 0%, #1a1a1a 100%);
  padding: 6rem 0;
  margin-bottom: 3rem;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.6);
  text-align: center;
  margin-top:-3.9rem;
`;

const HeaderTitle = styled.h1`
  font-family: 'Satoshi', sans-serif;
  font-size: 4rem;
  font-weight: 700;
  color: #f0f0f0; /* Near-white */
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  letter-spacing: 2px;
`;

const HeaderSubtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.8;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.5px;
`;

// Main content area
const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 5rem;
`;

// Card styling
const DataCard = styled.div`
  background-color: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
  }
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  padding: 2rem;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const CardTitle = styled.h3`
  font-family: 'Satoshi', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 1px;
`;

const FluencyBadge = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  color: #1a1a1a;
  background: ${({ score }) => {
    if (score >= 90) return '#b8d6be'; /* Muted Green */
    if (score >= 70) return '#e0d8b4'; /* Muted Yellow */
    return '#e0b4b4'; /* Muted Red */
  }};
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
`;

const CardBody = styled.div`
  padding: 3rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 2fr; /* 1/3 for video, 2/3 for analytics */
  }
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
`;

// Video player section
const VideoPlayerContainer = styled.div`
  width: 100%;
  position: relative;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
`;

const StyledVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  object-fit: cover;
`;

// Specific card sections
const SectionTitle = styled.h5`
  font-size: 1.4rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const StatValue = styled.div`
  font-size: 3.5rem;
  font-weight: 700;
  color: #e6b95b; /* Muted gold accent */
  line-height: 1;
`;

const StatLabel = styled.small`
  font-size: 1rem;
  color: #999;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const TranscriptBlockquote = styled.blockquote`
  background-color: rgba(255, 255, 255, 0.05);
  border-left: 5px solid #e6b95b;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  margin: 0;
`;

const TranscriptText = styled.p`
  font-size: 1rem;
  line-height: 1.8;
  color: #E0E0E0;
  font-style: italic;
`;

const KeyframesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const FrameImage = styled.img`
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
    z-index: 10;
  }
`;

// Loading and Error States
const LoadingMessage = styled.div`
  text-align: center;
  padding: 5rem 0;
  color: #999;
  font-size: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Spinner = styled.div`
  border: 4px solid #333;
  border-top: 4px solid #e6b95b;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.div`
  background-color: #331f22;
  border-left: 5px solid #dc3545;
  padding: 2rem;
  border-radius: 12px;
  color: #E0E0E0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.4);
`;

const PlaceholderCard = styled(DataCard)`
  text-align: center;
  padding: 5rem;
  background-color: rgba(30, 30, 30, 0.8);
`;

const PlaceholderEmoji = styled.div`
  font-size: 5rem;
  margin-bottom: 1rem;
  filter: grayscale(100%) opacity(50%);
`;

const PlaceholderButton = styled.a`
  display: inline-block;
  background: linear-gradient(45deg, #e6b95b, #c69c5a);
  color: #1a1a1a;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

function Dashboard() {
  const [metadataList, setMetadataList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      const API_URL = 'https://voicebackend-7.onrender.com/api/metadata';
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        });

        if (!response.ok) {
          const errorStatus = response.status;
          let errorMessage = `HTTP error! Status: ${errorStatus}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch { /* fallback */ }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.success) {
          setMetadataList(data.data || []);
        } else {
          throw new Error(data.error || 'Failed to load metadata');
        }
      } catch (err) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  const countMetrics = (item) => {
    let fillerWordsCount = 0;
    let pausesCount = 0;
    if (item.deepgram_words && item.deepgram_words.length > 0) {
      const fillerWords = ['uh', 'um', 'like', 'you know', 'so', 'and', 'but', 'well'];
      fillerWordsCount = item.deepgram_words.filter(word =>
        fillerWords.includes(word.word?.toLowerCase())
      ).length;
    }
    if (item.deepgram_transcript) {
      const pauses = item.deepgram_transcript.match(/\[PAUSE:.*?\]/g);
      if (pauses) {
        pausesCount = pauses.length;
      }
    }
    return { fillerWordsCount, pausesCount };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <DashboardContainer>
      <Header>
        <HeaderTitle>Video Analytics Dashboard</HeaderTitle>
        <HeaderSubtitle>
          Professional insights from your video content with advanced speech and visual analytics.
        </HeaderSubtitle>
      </Header>

      <MainContent>
        {isLoading && (
          <LoadingMessage>
            <Spinner />
            <span>Fetching video analytics...</span>
          </LoadingMessage>
        )}

        {error && (
          <ErrorMessage>
            <h4>⚠️ Connection Error</h4>
            <p>Unable to fetch data: <strong>{error}</strong></p>
            <p style={{ opacity: 0.8 }}>
              Make sure your backend server is running on port 7000. Try: `node index.js`
            </p>
          </ErrorMessage>
        )}

        {!isLoading && !error && (
          <>
            {metadataList.length > 0 ? (
              <div className="d-flex flex-column gap-5">
                {metadataList.map(item => {
                  const { fillerWordsCount, pausesCount } = countMetrics(item);
                  const totalWords = item.deepgram_words ? item.deepgram_words.length : 0;
                  const fluencyScore = totalWords > 0
                    ? ((totalWords - fillerWordsCount) / totalWords) * 100
                    : 100;

                  return (
                    <DataCard key={item.id}>
                      <CardHeader>
                        <div>
                          <CardTitle>🎥 {item.original_name || 'Untitled Video'}</CardTitle>
                          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                            Uploaded: {formatDate(item.created_at)}
                          </p>
                        </div>
                        <FluencyBadge score={fluencyScore}>
                          📈 {fluencyScore.toFixed(1)}% Fluency
                        </FluencyBadge>
                      </CardHeader>

                      <CardBody>
                        {/* Video Player */}
                        <div style={{ paddingRight: '2rem' }}>
                          <SectionTitle>▶️ Video Preview</SectionTitle>
                          <VideoPlayerContainer>
                            {item.video_url ? (
                              <StyledVideo controls src={item.video_url} />
                            ) : (
                              <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}>
                                <span style={{ opacity: 0.7 }}>No video available</span>
                              </div>
                            )}
                          </VideoPlayerContainer>
                        </div>

                        {/* Analytics and Transcript */}
                        <AnalyticsGrid>
                          <div>
                            <SectionTitle>📊 Speech Analytics</SectionTitle>
                            <StatGrid>
                              <StatCard>
                                <StatValue>{totalWords}</StatValue>
                                <StatLabel>Total Words</StatLabel>
                              </StatCard>
                              <StatCard>
                                <StatValue>{fillerWordsCount}</StatValue>
                                <StatLabel>Filler Words</StatLabel>
                              </StatCard>
                              <StatCard style={{ gridColumn: 'span 2' }}>
                                <StatValue>{pausesCount}</StatValue>
                                <StatLabel>Speech Pauses</StatLabel>
                              </StatCard>
                            </StatGrid>
                          </div>
                          
                          <div>
                            <SectionTitle>💬 Transcript</SectionTitle>
                            <TranscriptBlockquote>
                              <TranscriptText>
                                {item.deepgram_transcript || 'No transcript available.'}
                              </TranscriptText>
                            </TranscriptBlockquote>
                          </div>

                          <div>
                            <SectionTitle>🖼️ Key Frames ({item.frames ? item.frames.length : 0})</SectionTitle>
                            {item.frames && item.frames.length > 0 ? (
                              <KeyframesGrid>
                                {item.frames.map((frame, index) => (
                                  <a key={index} href={frame.frame_url} target="_blank" rel="noopener noreferrer">
                                    <FrameImage src={frame.frame_url} alt={`Frame ${index + 1}`} />
                                  </a>
                                ))}
                              </KeyframesGrid>
                            ) : (
                              <p style={{ opacity: 0.7, fontStyle: 'italic' }}>
                                No key frames extracted.
                              </p>
                            )}
                          </div>
                        </AnalyticsGrid>
                      </CardBody>
                    </DataCard>
                  );
                })}
              </div>
            ) : (
              <PlaceholderCard>
                <PlaceholderEmoji>🎥</PlaceholderEmoji>
                <h4 style={{ color: '#fff' }}>No Videos Found</h4>
                <p style={{ color: '#888' }}>
                  Upload your first video to start analyzing speech patterns and visual insights.
                </p>
                <PlaceholderButton href="#">
                  📤 Upload Video
                </PlaceholderButton>
              </PlaceholderCard>
            )}
          </>
        )}
      </MainContent>
    </DashboardContainer>
  );
}

export default Dashboard;