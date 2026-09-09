///|
fn main {
  let registry = @ipc.CommandRegistry::new()
  try {
    registry.register_json(@ipc.CommandName::new("game.host"), _ => {
      Ok({ "name": "Orbit", "version": "0.1.0-alpha.8" })
    })
    let options = @core.DesktopOptions::new(
      windows=configured_windows(),
      ipc_registry=Some(registry),
      ipc_policy=Some(configured_ipc_policy()),
    )
    let factory = @moonview_runtime.MoonViewRuntimeFactory::new()
      as &@runtime.RuntimeFactory
    let code = @core.run(factory, options)
    if code != 0 {
      abort("Orbit Voxel exited with code \{code}")
    }
  } catch {
    error => abort("Orbit Voxel: \{error}")
  }
}
