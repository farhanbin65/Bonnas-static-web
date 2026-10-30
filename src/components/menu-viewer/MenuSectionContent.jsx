import OrderingFlowchart from '../OrderingFlowchart';
import MenuPreviewGrid from './MenuPreviewGrid';

export default function MenuSectionContent() {
  return <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.6fr)] items-start gap-10 lg:gap-12">
    <OrderingFlowchart compact />
    <MenuPreviewGrid compact />
  </div>;
}
