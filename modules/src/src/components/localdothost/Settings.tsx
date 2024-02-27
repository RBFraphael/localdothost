export default function Settings()
{
    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-12">
                    <h2>Settings</h2>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <div className="form-check form-switch mb-2">
                        <input type="checkbox" name="startOnBoot" id="startOnBoot" className="form-check-input" />
                        <label htmlFor="startOnBoot" className="form-check-label">Start on Windows boot</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                        <input type="checkbox" name="startMinimized" id="startMinimized" className="form-check-input" />
                        <label htmlFor="startMinimized" className="form-check-label">Start minimized (on tray)</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                        <input type="checkbox" name="minimizeToTray" id="minimizeToTray" className="form-check-input" />
                        <label htmlFor="minimizeToTray" className="form-check-label">Minimize to Tray</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                        <input type="checkbox" name="closeMinimizes" id="closeMinimizes" className="form-check-input" />
                        <label htmlFor="closeMinimizes" className="form-check-label">Close minimizes</label>
                    </div>
                </div>
            </div>
        </div>
    );
}
