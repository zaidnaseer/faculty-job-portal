import { useRef } from 'react';
import Slider from 'react-slick';
import JobCard from './JobCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const FeaturedJobSlider = ({ jobs }) => {
  const sliderRef = useRef(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  // Filter and ensure jobs are unique by job id
  const featuredJobs = Array.from(new Set(jobs.filter(job => job.featured).map(job => job.id)))
    .map(id => jobs.find(job => job.id === id));

  return (
    <div className="featured-slider py-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Featured Opportunities</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => sliderRef.current.slickPrev()}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              ←
            </button>
            <button 
              onClick={() => sliderRef.current.slickNext()}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              →
            </button>
          </div>
        </div>
        
        <Slider ref={sliderRef} {...settings}>
          {featuredJobs.map(job => (
            <div key={job.id} className="px-2 h-full">
              <JobCard job={job} featured={true} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default FeaturedJobSlider;
