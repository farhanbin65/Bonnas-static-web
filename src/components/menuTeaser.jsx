import MenuPreviewGrid from './menu-viewer/MenuPreviewGrid';
import OrderingFlowchart from './OrderingFlowchart';

export default function MenuTeaser() {
  return <>
    <section className="px-6 md:px-12 bg-night"><MenuPreviewGrid /></section>
    <OrderingFlowchart />
  </>;
}
