import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../services/healthservice";

function HealthPage() {
    const {
        data,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["health"],
        queryFn: getHealth,
    });

    if (isLoading) {
        return <p>Checking backend...</p>;
    }

    if (isError) {
        return (
            <div>
                <h1>Backend Connection Failed</h1>
                <p>{error.message}</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Cloud Meta Cloud Storage</h1>
            <p>Backend Status: {data.status}</p>
        </div>
    );
};

export default HealthPage;