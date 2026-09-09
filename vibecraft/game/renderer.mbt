// Orbit adapter: Three.js owns GPU resources; MoonBit owns chunk geometry.

///|
priv struct Renderer {
  canvas : JsValue
  handle : JsValue
  mut width : Int
  mut height : Int
}

///|
fn fixed(values : Array[Double]) -> FixedArray[Double] {
  FixedArray::makei(values.length(), i => values[i])
}

///|
extern "js" fn three_create(canvas : JsValue, atlas : JsValue) -> JsValue =
  #| (canvas, atlas) => window.orbitVoxel.createRenderer(canvas, atlas)

///|
extern "js" fn three_resize(
  handle : JsValue,
  width : Int,
  height : Int,
) -> Unit =
  #| (r, w, h) => r.resize(w, h)

///|
extern "js" fn three_reset(handle : JsValue, count : Int) -> Unit =
  #| (r, count) => r.reset(count)

///|
extern "js" fn three_upload(
  handle : JsValue,
  index : Int,
  layer : Int,
  positions : FixedArray[Double],
  colors : FixedArray[Double],
  uvs : FixedArray[Double],
  count : Int,
) -> Unit =
  #| (r, index, layer, positions, colors, uvs, count) => r.upload(index, layer, positions, colors, uvs, count)

///|
extern "js" fn three_draw(
  handle : JsValue,
  vp : FixedArray[Double],
  x : Double,
  y : Double,
  z : Double,
  strength : Double,
) -> Unit =
  #| (r, vp, x, y, z, strength) => r.draw(vp, x, y, z, strength)

///|
fn renderer_init(canvas : JsValue) -> Renderer {
  {
    canvas,
    handle: three_create(canvas, dom_create_atlas()),
    width: 0,
    height: 0,
  }
}

///|
fn Renderer::resize(self : Renderer, width : Int, height : Int) -> Unit {
  if width != self.width || height != self.height {
    self.width = width
    self.height = height
    three_resize(self.handle, width, height)
  }
}

///|
fn Renderer::upload_chunk_meshes(
  self : Renderer,
  meshes : Array[ChunkMesh],
) -> Unit {
  three_reset(self.handle, meshes.length())
  for i, mesh in meshes {
    self.update_chunk(i, mesh)
  }
}

///|
fn Renderer::update_chunk(
  self : Renderer,
  index : Int,
  mesh : ChunkMesh,
) -> Unit {
  for layer, part in [mesh.solid, mesh.cutout, mesh.trans] {
    three_upload(
      self.handle,
      index,
      layer,
      fixed(part.positions),
      fixed(part.colors),
      fixed(part.uvs),
      part.vertex_count,
    )
  }
}

///|
fn Renderer::upload_particles(self : Renderer, mesh : Mesh) -> Unit {
  three_upload(
    self.handle,
    -1,
    0,
    fixed(mesh.positions),
    fixed(mesh.colors),
    fixed(mesh.uvs),
    mesh.vertex_count,
  )
}

///|
fn Renderer::clear_particles(self : Renderer) -> Unit {
  three_upload(self.handle, -1, 0, [], [], [], 0)
}

///|
fn Renderer::draw(
  self : Renderer,
  vp : Array[Double],
  tint : Vec3,
  strength : Double,
) -> Unit {
  three_draw(self.handle, fixed(vp), tint.x, tint.y, tint.z, strength)
}
