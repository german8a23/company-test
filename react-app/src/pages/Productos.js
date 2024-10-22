import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { useDropzone } from "react-dropzone";
import { Link } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';
import { FaRegPenToSquare } from "react-icons/fa6";
import Swal from 'sweetalert2';
import '../styles/productos.scss';

const TablaProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [editarProductoData, setEditarProductoData] = useState({ id: null, nombre: '', stock: 0, precio: 0, foto: null, categoria: '' });
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [nuevoProductoData, setNuevoProductoData] = useState({ nombre: '', stock: 0, precio: 0, foto: null, categoria: '' });
  const [foto, setFoto] = useState(null);


  useEffect(() => {
    fetchData();
    fetchCategorias();
  }, []);


  const fetchCategorias = async () => {
    try {
      const response = await axios.get('http://localhost:3000/categorias');
      console.log('Categorías cargadas:', response.data);
      setCategorias(response.data);
    } catch (error) {
      console.error('Error al obtener las categorías', error);
    }
  };

  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedImage = acceptedFiles[0];
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onloadend = () => {
        setFoto(reader.result);
      };
    }
  }

  const handleClick = () => {
    document.getElementById('file-input').click();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = () => {
        setFoto(reader.result);
      };
    }
  };


  const { getRootProps, getInputProps, open } = useDropzone({
    accept: '*/*',
    onDrop: handleDrop,
    noClick: true,
    noKeyboard: true,
  });

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener los productos', error);
    }
  }

  const editarProducto = (id, nombre, stock, precio, foto, categoria) => {
    setEditarProductoData({ id, nombre, stock, precio, foto: null, categoria });
    setShowEditarModal(true);
  }

  const formIsValid = () => {
    return (
      editarProductoData.nombre.trim().length >= 3 &&
      editarProductoData.stock > 0 &&
      editarProductoData.precio > 0 &&
      editarProductoData.categoria.trim().length >= 3
    );
  };

  const formIsValidCreate = () => {
    return (
      nuevoProductoData.nombre.trim().length >= 3 &&
      nuevoProductoData.stock > 0 &&
      nuevoProductoData.precio > 0 &&
      nuevoProductoData.categoria.trim().length >= 3
    );
  };

  const guardarCambiosProducto = async () => {
    try {
      if (editarProductoData.id) {
        const formData = new FormData();
        formData.append('nombre', editarProductoData.nombre);
        formData.append('stock', editarProductoData.stock);
        formData.append('precio', editarProductoData.precio);
        formData.append('categoria', editarProductoData.categoria);

        if (foto) {
          const base64Image = foto.split(',')[1];
          formData.append('foto', base64Image);

          axios.put(`http://localhost:3000/productos/${editarProductoData.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(() => {
            setShowEditarModal(false);
            fetchData();
          }).catch(error => {
            console.error('Error al editar el producto', error);
          });
        } else {
          await axios.put(`http://localhost:3000/productos/${editarProductoData.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          setShowEditarModal(false);
          fetchData();
        }
      } else {
        console.error('El ID del producto no está definido o no es válido');
      }
    } catch (error) {
      console.error('Error al editar el producto', error);
    }
  }

  const eliminarProducto = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/productos/${id}`);
        setProductos(productos.filter(producto => producto._id !== id));
        Swal.fire(
          'Eliminado',
          'El producto ha sido eliminado.',
          'success'
        );
      } catch (error) {
        console.error('Error al eliminar el producto', error);
        Swal.fire(
          'Error',
          'Hubo un problema al eliminar el producto.',
          'error'
        );
      }
    }
  };


  const crearProducto = async () => {
    try {
      const formData = new FormData();
      formData.append('nombre', nuevoProductoData.nombre);
      formData.append('stock', nuevoProductoData.stock);
      formData.append('precio', nuevoProductoData.precio);
      formData.append('categoria', nuevoProductoData.categoria);

      if (foto) {
        const base64Image = foto.split(',')[1];
        formData.append('foto', base64Image);

        axios.post('http://localhost:3000/productos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(() => {
          setShowCrearModal(false);
          setNuevoProductoData({ nombre: '', stock: 0, precio: 0, foto: null, categoria: '' });
          setFoto(null);
          fetchData();
        }).catch(error => {
          console.error('Error al crear el producto', error);
        });
      } else {
     
        await axios.post('http://localhost:3000/productos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setShowCrearModal(false);
        setNuevoProductoData({ nombre: '', stock: 0, precio: 0, foto: null, categoria: '' });
        setFoto(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error al crear el producto', error);
    }
  };


  const filtrarProductos = useCallback(async () => {
    if (nombreFiltro.trim() === '') {
      fetchData();
    } else {
      const response = await axios.get(`http://localhost:3000/productos/buscar/${nombreFiltro}`);
      setProductos(response.data);
    }
  }, [nombreFiltro]);

  useEffect(() => {
    filtrarProductos();
  }, [filtrarProductos]);

  return (

    <div className='contenedor-productos-principal'>
      <div className='contenedor-posicion'>
        <div className='input-filtro-productos'>
          <div className='search-container'>
            <input
              type="text"
              placeholder="Filtrar por nombre o categoria"
              value={nombreFiltro}
              onChange={(event) => setNombreFiltro(event.target.value)}
            />
          </div>
        </div>
        <div className='boton-crear-producto'>
          <Button onClick={() => setShowCrearModal(true)} >Crear Producto</Button>
        </div>
      </div>


      <Table className='tabla-contenedor-productos'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Foto</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(producto => (
            <tr key={producto.id}>
              <td>{producto.id}</td>
              <td>{producto.nombre}</td>
              <td>{producto.stock}</td>
              <td>{producto.precio}</td>

              <td>
                {producto.foto && (
                  <img src={`data:image/jpg;base64,${producto.foto}`} alt="Producto" className="product-images" />
                )}
              </td>

              <td>{producto.categoria}</td>
              <td>

                <Button className='separacion' onClick={() => editarProducto(producto._id, producto.nombre, producto.stock, producto.precio, producto.foto, producto.categoria)}>
                  <FaRegPenToSquare />
                </Button>

                <Button className='separacion' onClick={() => eliminarProducto(producto._id)}>
                  <FaIcons.FaTrashAlt />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showEditarModal} onHide={() => setShowEditarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" value={editarProductoData.nombre} onChange={(e) => setEditarProductoData({ ...editarProductoData, nombre: e.target.value })} />
              {editarProductoData.nombre.trim().length < 3 && <span className="error-message">El nombre debe tener al menos 3 caracteres</span>}
            </Form.Group>
            <Form.Group controlId="formStock">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" value={editarProductoData.stock} onChange={(e) => setEditarProductoData({ ...editarProductoData, stock: Number(e.target.value) })} />
              {editarProductoData.stock <= 0 && <span className="error-message">El stock debe ser mayor a 0</span>}
            </Form.Group>
            <Form.Group controlId="formPrecio">
              <Form.Label>Precio</Form.Label>
              <Form.Control type="number" value={editarProductoData.precio} onChange={(e) => setEditarProductoData({ ...editarProductoData, precio: Number(e.target.value) })} />
              {editarProductoData.precio <= 0 && <span className="error-message">El precio debe ser mayor a 0</span>}
            </Form.Group>

            <Form.Group controlId="formFoto">
              <Form.Label>Foto</Form.Label>
              <div
                {...getRootProps()}
                onClick={handleClick}
                className={`dropzone ${foto ? 'has-image' : ''}`}
              >
                <input {...getInputProps()} id="file-input" onChange={handleFileChange} />
                {foto ? (
                  <img src={foto} alt="Imagen seleccionada" className="selected-image" />
                ) : (
                  <p>Arrastra y suelta una imagen aquí o haz clic para seleccionar una imagen</p>
                )}
              </div>
              <Button className='seleccionar-imagen-boton' onClick={open}>
                Seleccionar desde la computadora
              </Button>
            </Form.Group>

            <Form.Group controlId="formCategoria">
              <Form.Label>Categoría</Form.Label>
              <Form.Control as="select" className='hacker-select' value={editarProductoData.categoria} onChange={(e) => setEditarProductoData({ ...editarProductoData, categoria: e.target.value })}>
                <option value="">Seleccione una categoría</option>
                {categorias.map((categoria, index) => (
                  <option key={index} value={categoria.nombre}>{categoria.nombre}</option>
                ))}
              </Form.Control>
              {editarProductoData.categoria.trim().length < 3 && <span className="error-message">La categoría debe tener al menos 3 caracteres</span>}
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer className='modal-footer'>
          <Button variant="secondary" onClick={() => setShowEditarModal(false)}>
            Cancelar
          </Button>

          <Link className='boton-ver-detalle' to={`/detalle/${editarProductoData.id}`}>Ver Detalle</Link>
          <Button variant="primary" onClick={guardarCambiosProducto} disabled={!formIsValid()}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>


      <Modal show={showCrearModal} onHide={() => setShowCrearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" value={nuevoProductoData.nombre} onChange={(e) => setNuevoProductoData({ ...nuevoProductoData, nombre: e.target.value })} />
              {nuevoProductoData.nombre.trim().length < 3 && <span className="error-message">El nombre debe tener al menos 3 caracteres</span>}
            </Form.Group>
            <Form.Group controlId="formStock">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" value={nuevoProductoData.stock} onChange={(e) => setNuevoProductoData({ ...nuevoProductoData, stock: Number(e.target.value) })} />
              {nuevoProductoData.stock <= 0 && <span className="error-message">El stock debe ser mayor a 0</span>}
            </Form.Group>
            <Form.Group controlId="formPrecio">
              <Form.Label>Precio</Form.Label>
              <Form.Control type="number" value={nuevoProductoData.precio} onChange={(e) => setNuevoProductoData({ ...nuevoProductoData, precio: Number(e.target.value) })} />
              {nuevoProductoData.precio <= 0 && <span className="error-message">El precio debe ser mayor a 0</span>}
            </Form.Group>

            <Form.Group controlId="formFoto">
              <Form.Label>Foto</Form.Label>
              <div
                {...getRootProps()}
                onClick={handleClick}
                className={`dropzone ${foto ? 'has-image' : ''}`}
              >
                <input {...getInputProps()} id="file-input" onChange={handleFileChange} />
                {foto ? (
                  <img src={foto} alt="Imagen seleccionada" className="selected-image" />
                ) : (
                  <p>Arrastra y suelta una imagen aquí o haz clic para seleccionar una imagen</p>
                )}
              </div>
              <Button className='seleccionar-imagen-boton' onClick={open}>
                Seleccionar desde la computadora
              </Button>
            </Form.Group>

            <Form.Group controlId="formCategoria">
              <Form.Label>Categoría</Form.Label>
              <Form.Control as="select" className='hacker-select' value={nuevoProductoData.categoria} onChange={(e) => setNuevoProductoData({ ...nuevoProductoData, categoria: e.target.value })}>
                <option value="">Seleccione una categoría</option>
                {categorias.map((categoria, index) => (
                  <option key={index} value={categoria.nombre}>{categoria.nombre}</option>
                ))}
              </Form.Control>
              {nuevoProductoData.categoria.trim().length < 3 && <span className="error-message">La categoría debe tener al menos 3 caracteres</span>}
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCrearModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={crearProducto} disabled={!formIsValidCreate()}>
            Crear Producto
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}


export default TablaProductos;











































































































