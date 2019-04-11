import SingleItem from '../components/SingleItem';

const Item = ({ query }) => {
  return (
    <>
      <h1>SingleItem</h1>
      <SingleItem id={query.id} />
    </>
  );
};
export default Item;
