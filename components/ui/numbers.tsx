export default function Numbers() {
  return (
    <div className="bg-gray-50 rounded-3xl p-12 mb-24 animate">
      <h3 className="text-2xl font-bold text-secondary text-center mb-12">
        I Numeri che Parlano di Noi
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-4">
        
        <div className="text-center">
          <div className="text-5xl font-bold text-primary mb-2">5k+</div>
          <div className="text-gray-600">Clienti Soddisfatti</div>
        </div>
        
        <div className="text-center">
          <div className="text-5xl font-bold text-primary mb-2">4.9</div>
          <div className="text-gray-600">Valutazione Media</div>
        </div>
        
        <div className="text-center col-span-2 lg:col-span-1 mx-auto max-w-[200px]">
          <div className="text-5xl font-bold text-primary mb-2">99.8%</div>
          <div className="text-gray-600">Consegne Puntuali</div>
        </div>
      </div>
    </div>
  )
}