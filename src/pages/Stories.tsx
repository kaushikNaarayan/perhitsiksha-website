import React, { useState, useEffect } from 'react';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import type { Story } from '../types';

// Import data
import storiesData from '../data/stories.json';

const Stories: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const categories = ['All', 'Education', 'Career', 'Community'];

  useEffect(() => {
    const typedStories = storiesData as Story[];
    setStories(typedStories);
    setFilteredStories(typedStories);
  }, []);

  useEffect(() => {
    let filtered = stories;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(story => story.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStories(filtered);
  }, [stories, selectedCategory, searchTerm]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
  };

  const closeModal = () => {
    setSelectedStory(null);
  };

  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="Stories of Transformation"
        subtitle="Discover how education changes lives and creates ripples of positive impact in communities across India."
      />

      {/* Filters and Search */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-1/3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredStories.length} of {stories.length} stories
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          {filteredStories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No stories found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map((story) => (
                <Card 
                  key={story.id} 
                  className="hover-lift cursor-pointer"
                  onClick={() => handleStoryClick(story)}
                >
                  {story.image && (
                    <div className="aspect-4-3 bg-gray-200">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                        {story.category}
                      </span>
                      <span className="text-sm text-gray-500 ml-auto">
                        {new Date(story.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {story.excerpt}
                    </p>
                    <Button variant="outline" size="sm">
                      Read Full Story
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Story Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div className="flex items-center">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full mr-3">
                  {selectedStory.category}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedStory.date).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {selectedStory.image && (
                <div className="aspect-4-3 bg-gray-200 rounded-lg mb-6">
                  <img
                    src={selectedStory.image}
                    alt={selectedStory.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              
              <h1 className="heading-2 mb-4">{selectedStory.title}</h1>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedStory.content}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Button variant="primary" href="#contribute">
                  Support More Students
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;