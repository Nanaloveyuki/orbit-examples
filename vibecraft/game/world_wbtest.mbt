///|
test "chunk coordinates round trip across negative boundaries" {
  for x in [-33, -32, -17, -16, -1, 0, 1, 15, 16, 32] {
    let chunk = div_floor(x, 16)
    let offset = mod_floor(x, 16)
    assert_true(offset >= 0 && offset < 16)
    assert_eq(chunk * 16 + offset, x)
  }
}

///|
test "world bounds and edits at chunk boundaries" {
  let world = World::new(2000, 16, 32)
  assert_true(world.get(0, -1, 0) == Bedrock)
  assert_true(world.get(0, 2000, 0) == Air)
  assert_false(world.set(0, 0, 0, Air))
  assert_false(world.set(0, 2000, 0, Stone))
  for x in [-17, -16, -1, 0, 15, 16] {
    assert_true(world.set(x, 1990, -1, Brick))
    assert_true(world.get(x, 1990, -1) == Brick)
    assert_true(world.set(x, 1990, -1, Air))
    assert_true(world.get(x, 1990, -1) == Air)
  }
}

///|
test "raycast returns target and adjacent placement cell" {
  let world = World::new(2000, 16, 32)
  assert_true(world.set(-1, 1990, 0, Stone))
  let hit = raycast(world, vec3(-3.5, 1990.5, 0.5), vec3(1.0, 0.0, 0.0), 8.0)
  guard hit is Some(hit) else { fail("expected stone hit") }
  assert_eq((hit.x, hit.y, hit.z), (-1, 1990, 0))
  assert_eq((hit.prev_x, hit.prev_y, hit.prev_z), (-2, 1990, 0))
  assert_true(
    raycast(world, vec3(-3.5, 1990.5, 0.5), vec3(0.0, 0.0, 0.0), 8.0) is None,
  )
}

///|
test "one isolated block produces six textured faces" {
  let world = World::new(2000, 16, 32)
  assert_true(world.set(0, 1990, 0, Stone))
  let mesh = build_mesh_range(world, 0, 1, 0, 1, 1990, 1991)
  assert_eq(mesh.solid.vertex_count, 36)
  assert_eq(mesh.solid.positions.length(), 108)
  assert_eq(mesh.solid.colors.length(), 108)
  assert_eq(mesh.solid.uvs.length(), 72)
  assert_eq(mesh.cutout.vertex_count, 0)
  assert_eq(mesh.trans.vertex_count, 0)
}

///|
test "pruning keeps edits and terrain generation is deterministic" {
  let world = World::new(2000, 16, 32)
  let other = World::new(2000, 16, 32)
  for coordinate in [(-17, 8), (0, 0), (121, -42)] {
    let (x, z) = coordinate
    assert_eq(world.height_at(x, z), other.height_at(x, z))
  }
  assert_true(world.set(-1, 1990, 0, Brick))
  world.prune_chunks(Map([]))
  assert_true(world.get(-1, 1990, 0) == Brick)
}
