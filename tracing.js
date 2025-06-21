// tracing.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { SocketIoInstrumentation } = require('@opentelemetry/instrumentation-socket.io');

const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'load-test-server',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0',
});

const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'
});

const sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-express': {
                requestHook: (span, request) => {
                    span.setAttribute('http.route', request.route?.path);
                }
            }
        }),
        new SocketIoInstrumentation({
            traceReserved: true,
            emitEventTraceEvent: true
        })
    ]
});

sdk.start();
