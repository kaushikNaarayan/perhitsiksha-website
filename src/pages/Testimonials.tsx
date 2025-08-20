import React, { useState, useEffect } from 'react';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import VideoModal from '../components/ui/VideoModal';
import type { Testimonial } from '../types';
import { FaPlay, FaStar, FaQuoteLeft } from 'react-icons/fa';

// Import data
import testimonialsData from '../data/testimonials.json';

// Import images
import testimonialsHeroBg from '../assets/images/testimonials-hero-bg.png';

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<
    Testimonial[]
  >([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState<
    Testimonial[]
  >([]);
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [modalVideo, setModalVideo] = useState<{
    isOpen: boolean;
    videoId: string;
    title: string;
    celebrityName: string;
  }>({
    isOpen: false,
    videoId: '',
    title: '',
    celebrityName: '',
  });

  const roles = ['All', 'Student', 'Parent', 'Mentor', 'Contributor'];

  useEffect(() => {
    const typedTestimonials = testimonialsData as Testimonial[];
    setTestimonials(typedTestimonials);
    setFilteredTestimonials(typedTestimonials);
    setFeaturedTestimonials(typedTestimonials.filter(t => t.featured));
  }, []);

  useEffect(() => {
    if (selectedRole === 'All') {
      setFilteredTestimonials(testimonials);
    } else {
      setFilteredTestimonials(
        testimonials.filter(testimonial => testimonial.role === selectedRole)
      );
    }
  }, [testimonials, selectedRole]);

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
  };

  const handleVideoPlay = (testimonial: Testimonial) => {
    setModalVideo({
      isOpen: true,
      videoId: testimonial.youtubeId!,
      title: `${testimonial.name} - ${testimonial.role}`,
      celebrityName: testimonial.name,
    });
  };

  const handleModalClose = () => {
    setModalVideo({
      isOpen: false,
      videoId: '',
      title: '',
      celebrityName: '',
    });
  };

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="Voices of Change"
        subtitle="Hear directly from our community about how education transforms lives and creates lasting impact."
        backgroundImage={testimonialsHeroBg}
        overlay={true}
      />

      {/* Featured Testimonials Section */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Featured Impact Stories</h2>
            <p className="body-large text-gray-600 max-w-3xl mx-auto">
              Discover how education transforms lives through our most inspiring
              testimonials
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {featuredTestimonials.slice(0, 2).map(testimonial => (
              <Card
                key={testimonial.id}
                className="overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                {/* Video Preview */}
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={getYouTubeThumbnail(testimonial.youtubeId!)}
                    alt={`${testimonial.name} testimonial`}
                    className="w-full h-full object-cover"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://img.youtube.com/vi/${testimonial.youtubeId}/hqdefault.jpg`;
                    }}
                  />

                  {/* Play Button Overlay */}
                  <div
                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer group-hover:bg-opacity-50 transition-all duration-200"
                    onClick={() => handleVideoPlay(testimonial)}
                  >
                    <div className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <FaPlay className="text-2xl text-gray-800 ml-1" />
                    </div>
                  </div>

                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <FaStar className="w-3 h-3 mr-1" />
                      Featured
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {testimonial.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            testimonial.role === 'Student'
                              ? 'bg-blue-100 text-blue-800'
                              : testimonial.role === 'Parent'
                                ? 'bg-green-100 text-green-800'
                                : testimonial.role === 'Mentor'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {testimonial.role}
                        </span>
                        <span className="text-sm text-gray-500">
                          {testimonial.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <FaQuoteLeft className="absolute -top-2 -left-1 text-primary-200 text-2xl" />
                    <blockquote className="text-gray-700 italic leading-relaxed pl-6">
                      "{testimonial.quote}"
                    </blockquote>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-gray-50 py-8 border-b">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                All Testimonials
              </h2>
              <p className="text-gray-600">
                Browse stories from our entire community
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {roles.map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleFilter(role)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedRole === role
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredTestimonials.length} testimonials
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Click any video to watch
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Grid */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          {filteredTestimonials.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No testimonials found
              </h3>
              <p className="text-gray-500">
                Try selecting a different role filter.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTestimonials.map(testimonial => (
                <Card
                  key={testimonial.id}
                  className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handleVideoPlay(testimonial)}
                >
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src={getYouTubeThumbnail(testimonial.youtubeId!)}
                      alt={`${testimonial.name} testimonial`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://img.youtube.com/vi/${testimonial.youtubeId}/hqdefault.jpg`;
                      }}
                    />

                    {/* Play Button */}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-200">
                      <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <FaPlay className="text-gray-800 ml-1" />
                      </div>
                    </div>

                    {/* Featured Badge */}
                    {testimonial.featured && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Featured
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {testimonial.name}
                        </h3>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            testimonial.role === 'Student'
                              ? 'bg-blue-100 text-blue-800'
                              : testimonial.role === 'Parent'
                                ? 'bg-green-100 text-green-800'
                                : testimonial.role === 'Mentor'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {testimonial.role}
                        </span>
                      </div>
                    </div>

                    <blockquote className="text-gray-600 text-sm italic leading-relaxed line-clamp-3">
                      "{testimonial.quote}"
                    </blockquote>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="bg-primary-500 text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="heading-2 mb-4">Your Support Creates These Stories</h2>
          <p className="text-xl mb-8 text-primary-100">
            Every testimonial represents a life transformed through education.
            Your contribution can create the next success story.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              href="https://wa.me/918142238633?text=Hi,%20I%20would%20like%20to%20contribute."
              className="text-primary-500 border-white hover:bg-white"
            >
              Become a Contributor
            </Button>
            <Button
              variant="outline"
              size="lg"
              href="/about"
              className="text-white border-white hover:bg-white hover:text-primary-500"
            >
              Learn More About Us
            </Button>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={modalVideo.isOpen}
        onClose={handleModalClose}
        videoId={modalVideo.videoId}
        title={modalVideo.title}
        celebrityName={modalVideo.celebrityName}
      />
    </div>
  );
};

export default Testimonials;
