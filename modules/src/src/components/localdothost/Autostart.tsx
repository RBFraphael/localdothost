export default function Autostart()
{
    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-12">
                    <h2>Autostart</h2>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <div className="mb-4">
                        <h4>Web Server</h4>
                        <div className="form-check form-switch mb-2">
                            <input type="checkbox" name="autostartApache" id="autostartApache" className="form-check-input" />
                            <label htmlFor="autostartApache" className="form-check-label">Apache Web Server</label>
                        </div>
                        <div className="form-check form-switch mb-2">
                            <input type="checkbox" name="autostartNginx" id="autostartNginx" className="form-check-input" />
                            <label htmlFor="autostartNginx" className="form-check-label">Nginx Web Server</label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4>Database</h4>
                        <div className="form-check form-switch mb-2">
                            <input type="checkbox" name="autostartMariaDB" id="autostartMariaDB" className="form-check-input" />
                            <label htmlFor="autostartMariaDB" className="form-check-label">MariaDB Database</label>
                        </div>
                        <div className="form-check form-switch mb-2">
                            <input type="checkbox" name="autostartMongoDB" id="autostartMongoDB" className="form-check-input" />
                            <label htmlFor="autostartMongoDB" className="form-check-label">MongoDB Database</label>
                        </div>
                        <div className="form-check form-switch mb-2">
                            <input type="checkbox" name="autostartPostgreSQL" id="autostartPostgreSQL" className="form-check-input" />
                            <label htmlFor="autostartPostgreSQL" className="form-check-label">PostgreSQL Database</label>
                        </div>
                        <div className="form-check form-switch mb-2">
                            <input type="checkbox" name="autostartRedis" id="autostartRedis" className="form-check-input" />
                            <label htmlFor="autostartRedis" className="form-check-label">Redis Database</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
