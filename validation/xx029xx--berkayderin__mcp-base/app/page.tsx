import Faqs from '@/components/core/home/Faqs';
import FeatureCards from '@/components/core/home/FeatureCards';
import HeadSection from '@/components/core/home/HeadSection';
import ProtocolBlock from '@/components/core/home/ProtocolBlock';

const Home = () => {
  return (
    <div>
      <HeadSection />
      <ProtocolBlock />
      <FeatureCards />
      <Faqs />
    </div>
  );
};

export default Home;
