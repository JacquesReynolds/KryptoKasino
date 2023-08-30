const CommunityCard = ({ id, card }) => {
  const cardContent = card ? (
    <div className="flex flex-col items-center w-full h-full">
      <p className={`text-3xl ${card.suit === '♦' || card.suit === '♥' ? 'text-red-600' : 'text-black'}`}>
        {card.rank}
      </p>
      <p className={`text-4xl ${card.suit === '♦' || card.suit === '♥' ? 'text-red-600' : 'text-black'}`}>
        {card.suit}
      </p>
    </div>
  ) : (
    <p>{}</p>
  );

  return (
    <div
      id={`community-card-${id}`}
      className="flex justify-center items-center rounded-lg border border-gray-500 p-4 mx-4 bg-white shadow-lg transform hover:scale-105 transition-all duration-300"
      style={{ width: "80px", height: "130px", borderRadius: "10px", position: "relative" }}
    >
      {cardContent}
      <div
        className="absolute top-0 left-0 w-full h-full border-2 border-white rounded-lg"
        style={{ transform: "rotate(-15deg)" }}
      ></div>
      <div
        className="absolute top-0 left-0 w-full h-full border-2 border-white rounded-lg"
        style={{ transform: "rotate(15deg)" }}
      ></div>
    </div>
  );
};

export default CommunityCard;
