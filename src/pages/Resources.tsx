import React, { useState } from "react";
import Layout from "../components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, Award, TrendingUp, ChevronDown, ChevronUp, Info, BookOpen, ListChecks, Layers, Map, HelpCircle, Tag, Plus } from "lucide-react";
import { motion } from "framer-motion";
import ResourceLoadingAnimation from '../components/ResourceLoadingAnimation';

const API_BASE_URL = "http://localhost:8080/api/readingMaterial";

const skeleton = (
  <div className="animate-pulse space-y-2">
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
    <div className="h-4 bg-gray-200 rounded w-2/3" />
  </div>
);

const benefitIcons = [<Award key="award" className="text-blue-500 w-6 h-6" />, <TrendingUp key="trend" className="text-green-500 w-6 h-6" />, <CheckCircle key="check" className="text-purple-500 w-6 h-6" />];

const popularTopics = ["React", "DSA", "System Design", "Machine Learning", "JavaScript", "Python", "Data Structures", "Algorithms", "TypeScript", "Node.js"];

const mapResourceData = (raw: any) => {
    if (!raw) return null;
  
    const topicName = raw.topic || Object.keys(raw).find(k => k !== "topic");
    const data = raw[topicName] || {};
  
    const mapped: any = { topicName };
  
    // Short Description
    mapped.shortDescription = data["Short Description"]?.["Description"] || "";
  
    // Need to Learn
    mapped.needToLearn = data["Need to Learn " + topicName] || null;
  
    // Map Resource Tabs
    const resourceTabsRaw = data["Resource Tab Suggestions"]?.["Description"];
    mapped.resourceTabs = Array.isArray(resourceTabsRaw) ? resourceTabsRaw : (typeof resourceTabsRaw === "string" ? resourceTabsRaw.split(",") : []);
  
    // SubTopics
    mapped.subTopics = data.SubTopics?.["Description"]?.subtopics || [];
  
    // Road Map
    mapped.roadMap = data["Road Map to Learn " + topicName]?.["Description"] || null;
  
    // Key Takeaways
    mapped.keyTakeaways = data["Key Takeaways"]?.["Description"] || [];
  
    // FAQs
    mapped.faqs = data["Frequently Asked Questions"]?.["Description"] || [];
  
    // Related Topics
    mapped.relatedTopics = data["Related Topics"]?.["Description"] || [];
  
    console.log("Mapped Data:", mapped);  // For Debugging
  
    return mapped;
  };
  

const Resources: React.FC = () => {
  const [search, setSearch] = useState("");
  const [loadingResource, setLoadingResource] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourceData, setResourceData] = useState<any>(null);
  const [standardResource, setStandardResource] = useState<any>(null);
  const [showSections, setShowSections] = useState({
    documentation: false,
    articles: false,
    youtube: false,
  });
  const [loadingSections, setLoadingSections] = useState({
    documentation: false,
    articles: false,
    youtube: false,
  });
  const [documentation, setDocumentation] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [showSectionModal, setShowSectionModal] = useState<null | 'documentation' | 'articles' | 'youtube'>(null);
  const [showFabMenu, setShowFabMenu] = useState(false);

  // Fetch resource data only
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoadingResource(true);
    setError(null);
    setResourceData(null);
    setStandardResource(null);
    setShowSections({ documentation: false, articles: false, youtube: false });
    setDocumentation([]);
    setArticles([]);
    setYoutubeVideos([]);
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${API_BASE_URL}/generateInfo/${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch resources");
      const resData = await res.json();
      setResourceData(resData);
      setStandardResource(mapResourceData(resData));
    } catch (err: any) {
      setError(typeof err === "string" ? err : err.message || "Something went wrong");
      toast.error(typeof err === "string" ? err : err.message || "Something went wrong");
    } finally {
      setLoadingResource(false);
    }
  };

  // Fetch documentation/articles/youtube on demand
  const fetchSection = async (section: "documentation" | "articles" | "youtube") => {
    setLoadingSections(prev => ({ ...prev, [section]: true }));
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("Not authenticated");
      if (section === "documentation" || section === "articles") {
        const res = await fetch(`${API_BASE_URL}/generateDocumentations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ topic: search }),
        });
        if (!res.ok) throw new Error(`Failed to fetch ${section}`);
        const data = await res.json();
        if (section === "documentation") {
          setDocumentation(data.filter((d: any) => d.type?.toLowerCase().includes("doc")));
        } else {
          setArticles(data.filter((a: any) => !a.type || !a.type.toLowerCase().includes("doc")));
        }
      } else if (section === "youtube") {
        const res = await fetch(`${API_BASE_URL}/searchYouTube`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query: search, maxResults: 8 }),
        });
        if (!res.ok) throw new Error("Failed to fetch YouTube videos");
        const data = await res.json();
        setYoutubeVideos(data);
      }
      setShowSections(prev => ({ ...prev, [section]: true }));
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : err.message || "Something went wrong");
    } finally {
      setLoadingSections(prev => ({ ...prev, [section]: false }));
    }
  };

  // Render all resource sections as expandable/collapsible
  const renderResourceSections = () => {
    if (!standardResource) return null;
    const { topicName, shortDescription, needToLearn, resourceTabs, subTopics, roadMap, keyTakeaways, faqs, relatedTopics } = standardResource;
    // Need to Learn
    const needToLearnDesc = needToLearn?.["### Description "] || "";
    const benefits = Object.values(needToLearn || {}).filter((v: any) => typeof v === "object" && v.heading);
    return (
      <div className="space-y-8">
        {/* Short Description Section */}
        <div className="border rounded-lg p-6 bg-blue-50 text-gray-800">
          <div className="flex items-center gap-2 mb-2 font-semibold text-lg"><Info className="w-5 h-5 text-blue-400" /> Short Description</div>
          <span dangerouslySetInnerHTML={{ __html: shortDescription }} />
        </div>
        {/* Need to Learn Section */}
        {needToLearn && (
          <div className="border rounded-lg p-6 bg-green-50">
            <div className="flex items-center gap-2 mb-2 font-semibold text-lg"><Award className="w-5 h-5 text-green-400" /> Why Learn {topicName}?</div>
            <div className="mb-4 text-gray-700">{needToLearnDesc}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {benefits.map((benefit: any, i: number) => (
                <div key={i} className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition">
                  {benefitIcons[i % benefitIcons.length]}
                  <div className="font-semibold mt-2 mb-1">{benefit.heading}</div>
                  <div className="text-gray-600 text-sm text-center">{benefit["### Description "]}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* SubTopics Section */}
        {subTopics.length > 0 && (
          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="flex items-center gap-2 mb-2 font-semibold text-lg"><Layers className="w-5 h-5 text-gray-400" /> SubTopics</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subTopics.map((sub: any, i: number) => (
                <div key={i} className="bg-white rounded shadow p-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-base">{sub.name}</div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{sub.difficulty}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Time: {sub.timeToComplete}</div>
                  <div className="text-gray-700 mt-2">{sub["### Description "]}</div>
                  {sub.whyItMatters && <div className="text-xs text-gray-600 mb-1 mt-2">Why it matters: {sub.whyItMatters}</div>}
                  {sub.commonMistakes && (
                    <div>
                      <div className="font-medium text-xs">Common Mistakes:</div>
                      <ul className="list-disc list-inside ml-4 text-xs">
                        {sub.commonMistakes.map((m: string, j: number) => <li key={j}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Resource Tab Suggestions Section */}
        {resourceTabs.length > 0 && (
          <div className="border rounded-lg p-6 bg-indigo-50">
            <div className="flex items-center gap-2 mb-2 font-semibold text-lg"><BookOpen className="w-5 h-5 text-indigo-400" /> Resource Tab Suggestions</div>
            <div className="flex flex-wrap gap-2">
              {resourceTabs.map((tab: string, i: number) => (
                <Button key={i} variant="outline" className="capitalize">{tab}</Button>
              ))}
            </div>
          </div>
        )}
        {/* Roadmap Section */}
        {roadMap && (
          <div className="border rounded-lg p-6 bg-yellow-50">
            <div className="flex items-center gap-2 mb-2 font-semibold text-lg"><Map className="w-5 h-5 text-yellow-400" /> Roadmap</div>
            {roadMap.prerequisites && (
              <div className="mb-2"><span className="font-medium">Prerequisites:</span> {roadMap.prerequisites.join(", ")}</div>
            )}
            {roadMap.levels && (
              <ol className="border-l-4 border-yellow-300 pl-4 space-y-4">
                {roadMap.levels.map((level: any, i: number) => (
                  <li key={i} className="relative">
                    <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-yellow-400 border-2 border-white" />
                    <div className="font-semibold">{level.name}</div>
                    <div className="text-xs text-gray-600 mb-1">Topics: {level.topics?.join(", ")}</div>
                    <div className="text-xs text-gray-700">How to Conquer: {level.howToConquer}</div>
                    <div className="text-xs text-gray-500 italic">Insider Tips: {level.insiderTips}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
        {/* Key Takeaways Section */}
        {keyTakeaways.length > 0 && (
          <div className="border rounded-lg p-6 bg-purple-50">
            <div className="flex items-center gap-2 mb-2 font-semibold text-lg"><ListChecks className="w-5 h-5 text-purple-400" /> Key Takeaways</div>
            <ul className="space-y-2">
              {keyTakeaways.map((point: string, i: number) => (
                <li key={i} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> {point}</li>
              ))}
            </ul>
          </div>
        )}
        {/* FAQs Section */}
        {faqs.length > 0 && (
          <div className="border rounded-lg p-6 bg-orange-50">
            <div className="flex items-center gap-2 mb-2 font-semibold text-lg"><HelpCircle className="w-5 h-5 text-orange-400" /> FAQs</div>
            <ul className="divide-y divide-orange-200">
              {faqs.map((faq: any, i: number) => (
                <li key={i} className="py-2">
                  <div className="font-medium">{faq.question}</div>
                  <div className="mt-2 text-gray-700">{faq.answer}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Related Topics Section */}
        {relatedTopics.length > 0 && (
          <div className="border rounded-lg p-6 bg-pink-50">
            <div className="flex items-center gap-2 mb-2 font-semibold text-lg"><Tag className="w-5 h-5 text-pink-400" /> Related Topics</div>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map((rel: any, i: number) => (
                <div key={i} className="bg-white border border-pink-200 rounded px-3 py-2 flex flex-col items-start hover:shadow transition cursor-pointer">
                  <div className="font-semibold text-pink-700 flex items-center gap-1"><Tag className="w-4 h-4" /> {rel.topic}</div>
                  <div className="text-xs text-gray-600 mt-1">{rel["### Description "]}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper to render resource cards (robust for all nested structures)
  const renderResourceCards = () => {
    if (!resourceData) return null;
    // Find the topic key (not 'topic')
    const topicKey = Object.keys(resourceData).find(k => k !== "topic");
    if (!topicKey) return null;
    const data = resourceData[topicKey];
    if (!data) return null;
    return (
      <div className="space-y-4">
        {/* Resource Tab Suggestions */}
        {data["Resource Tab Suggestions"]?.["### Description "]?.length > 0 && (
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded">
            <div className="font-semibold mb-1">Resource Tab Suggestions</div>
            <ul className="list-disc list-inside ml-2">
              {data["Resource Tab Suggestions"]["### Description "]?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Subtopics */}
        {data.SubTopics?.["### Description "]?.subtopics?.length > 0 && (
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
            <div className="font-semibold mb-2">Subtopics</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.SubTopics["### Description "]?.subtopics.map((sub: any, i: number) => (
                <details key={i} className="bg-white rounded shadow p-3">
                  <summary className="font-semibold cursor-pointer">{sub.name} <span className="text-xs text-gray-500 ml-2">({sub.difficulty})</span></summary>
                  <div className="mt-2 text-gray-700">{sub["### Description "]}</div>
                  <div className="text-xs text-gray-600 mt-1">Time to complete: {sub.timeToComplete}</div>
                  <div className="text-xs text-gray-600 mt-1">Why it matters: {sub.whyItMatters}</div>
                  {sub.commonMistakes && (
                    <div className="mt-2">
                      <div className="font-medium text-xs">Common Mistakes:</div>
                      <ul className="list-disc list-inside ml-4 text-xs">
                        {sub.commonMistakes.map((m: string, j: number) => <li key={j}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                </details>
              ))}
            </div>
          </div>
        )}
        {/* Roadmap */}
        {data[`Road Map to Learn ${topicKey}`]?.["### Description "] && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="font-semibold mb-1">Roadmap</div>
            {data[`Road Map to Learn ${topicKey}`]["### Description "]?.prerequisites && (
              <div className="mb-2">
                <span className="font-medium">Prerequisites:</span> {data[`Road Map to Learn ${topicKey}`]["### Description "]?.prerequisites.join(", ")}
              </div>
            )}
            {data[`Road Map to Learn ${topicKey}`]["### Description "]?.levels && (
              <ol className="list-decimal ml-4">
                {data[`Road Map to Learn ${topicKey}`]["### Description "]?.levels.map((level: any, i: number) => (
                  <li key={i} className="mb-2">
                    <span className="font-semibold">{level.name}:</span> {level.topics?.join(", ")}
                    <div className="text-xs text-gray-600">{level.howToConquer}</div>
                    <div className="text-xs text-gray-500 italic">{level.insiderTips}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
        {/* Key Takeaways */}
        {data["Key Takeaways"]?.["### Description "]?.length > 0 && (
          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
            <div className="font-semibold mb-1">Key Takeaways</div>
            <ul className="list-disc list-inside ml-2">
              {data["Key Takeaways"]["### Description "]?.map((point: string, i: number) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}
        {/* FAQs */}
        {data["Frequently Asked Questions"]?.["### Description "]?.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
            <div className="font-semibold mb-1">FAQs</div>
            <ul className="list-disc list-inside ml-2">
              {data["Frequently Asked Questions"]["### Description "]?.map((faq: any, i: number) => (
                <li key={i} className="mb-2">
                  <span className="font-medium">Q: {faq.question}</span>
                  <div className="ml-2">A: {faq.answer}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Related Topics */}
        {data["Related Topics"]?.["### Description "]?.length > 0 && (
          <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded">
            <div className="font-semibold mb-1">Related Topics</div>
            <ul className="list-disc list-inside ml-2">
              {data["Related Topics"]["### Description "]?.map((rel: any, i: number) => (
                <li key={i}>
                  <span className="font-medium">{rel.topic}:</span> {rel["### Description "]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Helper to render section modal content
  const renderSectionModal = () => {
    if (!showSectionModal) return null;
    let content = null;
    let title = '';
    if (showSectionModal === 'documentation') {
      title = 'Documentation';
      content = loadingSections.documentation ? skeleton : documentation.length > 0 ? (
        <ul className="space-y-2">
          {documentation.map((doc, i) => (
            <li key={i} className="flex items-center gap-2">
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                {doc.title}
              </a>
              {doc.readTime && <span className="ml-2 text-xs text-gray-500">({doc.readTime})</span>}
              {doc.type && <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">{doc.type}</span>}
            </li>
          ))}
        </ul>
      ) : <div className="text-gray-500">(No documentation found)</div>;
    } else if (showSectionModal === 'articles') {
      title = 'Articles';
      content = loadingSections.articles ? skeleton : articles.length > 0 ? (
        <ul className="space-y-2">
          {articles.map((art, i) => (
            <li key={i} className="flex items-center gap-2">
              <a href={art.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                {art.title}
              </a>
              {art.type && <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-semibold">{art.type}</span>}
            </li>
          ))}
        </ul>
      ) : <div className="text-gray-500">(No articles found)</div>;
    } else if (showSectionModal === 'youtube') {
      title = 'YouTube Videos';
      content = loadingSections.youtube ? skeleton : youtubeVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {youtubeVideos.map((vid, i) => (
            <a key={i} href={`https://youtube.com/watch?v=${vid.videoId}`} target="_blank" rel="noopener noreferrer" className="block border rounded p-3 hover:shadow transition bg-gray-50">
              <div className="flex gap-3 items-center mb-2">
                <img
                  src={`https://img.youtube.com/vi/${vid.videoId}/hqdefault.jpg`}
                  alt={vid.title}
                  className="w-24 h-16 object-cover rounded"
                  loading="lazy"
                />
                <div>
                  <div className="font-medium text-blue-700 mb-1 line-clamp-2">{vid.title}</div>
                  <div className="text-xs text-gray-500 mb-1">{vid.duration}</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 line-clamp-2">{vid.description}</div>
            </a>
          ))}
        </div>
      ) : <div className="text-gray-500">(No YouTube videos found)</div>;
    }
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={() => setShowSectionModal(null)}
      >
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative" onClick={e => e.stopPropagation()}>
          <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowSectionModal(null)}>&times;</button>
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          {content}
        </div>
      </motion.div>
    );
  };

  // Add handler for popular topic chip click
  const handlePopularTopic = (topic: string) => {
    setSearch(topic);
    setTimeout(() => {
      // Simulate form submit
      document.getElementById("resource-search-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }, 100);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-2"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">What do you want to learn today?</h1>
          <p className="text-lg text-gray-600">Type any topic—React, DSA, ML, anything!</p>
        </motion.div>
        {/* Popular Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
          className="flex flex-wrap gap-2 mb-2"
        >
          {popularTopics.map((topic) => (
            <button
              key={topic}
              className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm hover:bg-blue-200 transition-all duration-200 shadow-sm hover:scale-105"
              onClick={() => handlePopularTopic(topic)}
            >
              #{topic}
            </button>
          ))}
        </motion.div>
        {/* Search Bar */}
        <motion.form
          id="resource-search-form"
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-2xl flex flex-col sm:flex-row gap-2 items-center mb-4"
        >
          <Input
            type="text"
            placeholder="Enter a topic (e.g. React, Algorithms, DSA)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-lg py-6 rounded-xl shadow-lg focus:shadow-xl transition-all duration-200 border-2 border-transparent focus:border-blue-400"
            disabled={loadingResource}
            autoFocus
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <Button
              type="submit"
              className="h-12 text-lg w-full sm:w-auto rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 transition-all duration-200"
              disabled={loadingResource}
            >
              Search
            </Button>
          </motion.div>
        </motion.form>
        {/* Resource Data */}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded flex items-center justify-between w-full max-w-2xl">{error} <Button size="sm" onClick={handleSearch}>Retry</Button></div>}
        {loadingResource && (
          <div className="w-full max-w-2xl flex flex-col items-center justify-center py-12">
            <ResourceLoadingAnimation progress={50} />
            <p className="mt-4 text-gray-600">Generating learning resources...</p>
          </div>
        )}
        {!loadingResource && resourceData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full space-y-6 px-2 md:px-8"
          >
            {renderResourceSections()}
            {renderResourceCards()}
            {/* Floating Action Button */}
            <div className="fixed top-20 right-6 z-40 mb-4">
              {/* Add pulsing background */}
              <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75 w-14 h-14"></div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative bg-blue-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl focus:outline-none"
                onClick={() => setShowFabMenu(v => !v)}
                aria-label="Open resource sections"
                style={{ marginBottom: '1rem' }}
              >
                <motion.span
                  animate={{ rotate: showFabMenu ? 125 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="inline-block"
                >
                  <Plus className="w-6 h-6" />
                </motion.span>
              </motion.button>
              
              {showFabMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute top-16 right-0 flex flex-col gap-3 bg-white rounded-xl shadow-lg p-4"
                >
                  <Button variant="outline" onClick={() => { fetchSection('documentation'); setShowSectionModal('documentation'); setShowFabMenu(false); }}>Documentation</Button>
                  <Button variant="outline" onClick={() => { fetchSection('articles'); setShowSectionModal('articles'); setShowFabMenu(false); }}>Articles</Button>
                  <Button variant="outline" onClick={() => { fetchSection('youtube'); setShowSectionModal('youtube'); setShowFabMenu(false); }}>YouTube Videos</Button>
                </motion.div>
              )}
            </div>
            {/* Section Modal */}
            {renderSectionModal()}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Resources; 