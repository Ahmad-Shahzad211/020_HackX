const InfoMessage = ({ message }: { message: string }) => {
  return (
    <>
      {message.length > 0 && (
        <div
          className={`border rounded-lg px-6 py-4 shadow-sm ${
            message.includes("Success!")
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <p className="text-center">{message}</p>
        </div>
      )}
    </>
  );
};

export default InfoMessage;
