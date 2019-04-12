import Items from '../components/Items';

const items = ({ query }) => {
  const pageNumber = parseFloat(query.page);
  return (
    <>
      <h1>Items</h1>
      <Items page={pageNumber || 1} />
    </>
  );
};

export default items;
