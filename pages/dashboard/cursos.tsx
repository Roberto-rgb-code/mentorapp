// pages/dashboard/cursos.tsx
import PrivateLayout from '../../components/layout/PrivateLayout';

const Cursos = () => {
  const courses = [
    {
      id: 1,
      title: 'Curso de Marketing Digital',
      instructor: 'Juan Pérez',
      price: '$49',
      image: '/images/course1.jpg',
    },
    {
      id: 2,
      title: 'Finanzas para Emprendedores',
      instructor: 'María Gómez',
      price: '$59',
      image: '/images/course2.jpg',
    },
    {
      id: 3,
      title: 'Diseño Web con React',
      instructor: 'Carlos López',
      price: '$39',
      image: '/images/course3.jpg',
    },
  ];

  return (
    <PrivateLayout>
      <h1 className="text-3xl font-bold text-gray-800">Cursos</h1>
      <p className="mt-4 text-gray-600">Explora nuestra oferta de cursos en línea.</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-lg shadow-lg">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <h2 className="text-2xl font-bold text-gray-800 mt-4">{course.title}</h2>
            <p className="text-gray-600 mt-2">Instructor: {course.instructor}</p>
            <p className="text-gray-600 mt-2">Precio: {course.price}</p>
            <div className="mt-4 flex gap-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Comprar Ahora
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Suscribirse
              </button>
            </div>
          </div>
        ))}
      </div>
    </PrivateLayout>
  );
};

export default Cursos;